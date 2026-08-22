import { useEffect, useRef, useState } from 'react'
import type { Playback } from '../../hooks/usePlayback'

export function MockTerminal({ playback }: { playback: Playback }) {
  const [logs, setLogs] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const currentNode = playback.currentNode

  useEffect(() => {
      // Only process when playing and there's a new node
      if (!playback.isPlaying || !currentNode || !currentNode.data.mockLogs) return

      const nodeLogs = currentNode.data.mockLogs
      if (!nodeLogs.length) return

      let i = 0
      // Calculate a slight delay between lines so they stream in
      const timePerLine = Math.min((currentNode.data.duration || 2000) / (nodeLogs.length + 1) / playback.speed, 500)

      const interval = setInterval(() => {
          if (i < nodeLogs.length) {
              setLogs(prev => {
                  const newLogs = [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${currentNode.data.label}: ${nodeLogs[i]}`]
                  return newLogs.slice(-20) // Keep terminal from growing indefinitely
              })
              i++
          } else {
              clearInterval(interval)
          }
      }, timePerLine)

      return () => clearInterval(interval)
  }, [currentNode, playback.isPlaying, playback.speed])

  // Auto-scroll to bottom
  useEffect(() => {
      if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
  }, [logs])

  // Reset logs if playback restarts
  useEffect(() => {
      if (playback.currentIndex <= 0) {
          setLogs([])
      }
  }, [playback.currentIndex])

  return (
    <div className="w-full h-40 max-w-4xl mx-auto rounded-t-xl border-t border-l border-r border-gray-800 bg-[#0d1117] p-3 shadow-2xl flex flex-col pointer-events-auto">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest ml-2">Live Execution Telemetry</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-500 uppercase">System Active</span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-gray-300">
        {logs.length === 0 ? (
            <div className="text-gray-600 italic">Waiting for execution to begin...</div>
        ) : (
            logs.map((log, idx) => (
                <div key={idx} className="mb-0.5 break-all">
                    <span className="text-gray-500">{log.split('] ')[0]}]</span>
                    <span className="text-blue-400">{log.split('] ')[1].split(': ')[0]}:</span>
                    <span className="text-gray-300">{log.split(': ').slice(1).join(': ')}</span>
                </div>
            ))
        )}
      </div>
    </div>
  )
}

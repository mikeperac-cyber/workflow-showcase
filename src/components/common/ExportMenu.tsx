import { useEffect, useRef, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { Workflow, WorkflowNode } from '../../types/workflow'
import { useThemeStore } from '../../store/themeStore'
import { exportFlowImage } from '../../utils/exportImage'
import { exportFlowPdf } from '../../utils/exportPdf'
import { DownloadIcon, LinkIcon } from './Icon'
import { ShareModal } from './ShareModal'

const itemClass =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200'

/**
 * Export dropdown (PNG / SVG / PDF / share link).
 * Must be rendered inside a ReactFlowProvider so it can read node bounds.
 */
export function ExportMenu({ workflow }: { workflow: Workflow }) {
  const [open, setOpen] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { getNodes } = useReactFlow<WorkflowNode>()
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const background = theme === 'dark' ? '#030712' : '#f9fafb'

  const exportImage = (kind: 'png' | 'svg' | 'pdf') => {
    setOpen(false)
    if (kind === 'pdf') {
        void exportFlowPdf(getNodes(), workflow.name, background)
    } else {
        void exportFlowImage(kind, getNodes(), workflow.name, background)
    }
  }

  return (
    <>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
        >
          <DownloadIcon /> Export & Share
        </button>
        {open && (
          <div className="absolute right-0 z-50 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <button type="button" className={itemClass} onClick={() => exportImage('png')}>
              <DownloadIcon /> Export as PNG
            </button>
            <button type="button" className={itemClass} onClick={() => exportImage('svg')}>
              <DownloadIcon /> Export as SVG
            </button>
            <button type="button" className={itemClass} onClick={() => exportImage('pdf')}>
              <DownloadIcon /> Export as PDF
            </button>
            <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>
            <button type="button" className={itemClass} onClick={() => { setOpen(false); setShowShare(true); }}>
              <LinkIcon /> Advanced Share Options
            </button>
          </div>
        )}
      </div>
      {showShare && <ShareModal workflow={workflow} onClose={() => setShowShare(false)} />}
    </>
  )
}

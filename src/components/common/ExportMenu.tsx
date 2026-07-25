import { useEffect, useRef, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { Workflow, WorkflowNode } from '../../types/workflow'
import { useThemeStore } from '../../store/themeStore'
import { exportFlowImage } from '../../utils/exportImage'
import { buildShareUrl, SHARE_URL_WARN_LENGTH } from '../../utils/shareLink'
import { DownloadIcon, LinkIcon } from './Icon'

const itemClass =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700'

/**
 * Export dropdown (PNG / SVG / share link).
 * Must be rendered inside a ReactFlowProvider so it can read node bounds.
 */
export function ExportMenu({ workflow }: { workflow: Workflow }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [warn, setWarn] = useState(false)
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

  const exportImage = (kind: 'png' | 'svg') => {
    setOpen(false)
    void exportFlowImage(kind, getNodes(), workflow.name, background)
  }

  const copyShareLink = async () => {
    const url = buildShareUrl(workflow)
    setWarn(url.length > SHARE_URL_WARN_LENGTH)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this share link:', url)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <DownloadIcon /> Export
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <button type="button" className={itemClass} onClick={() => exportImage('png')}>
            <DownloadIcon /> Export as PNG
          </button>
          <button type="button" className={itemClass} onClick={() => exportImage('svg')}>
            <DownloadIcon /> Export as SVG
          </button>
          <button type="button" className={itemClass} onClick={() => void copyShareLink()}>
            <LinkIcon /> {copied ? 'Link copied!' : 'Copy share link'}
          </button>
          {(copied || warn) && (
            <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
              {warn
                ? 'This link is very long and may not paste everywhere.'
                : 'Anyone with the link can view this workflow.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

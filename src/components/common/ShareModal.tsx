import { useState } from 'react'
import type { Workflow } from '../../types/workflow'
import { buildShareUrl } from '../../utils/shareLink'
import { QRCodeSVG } from 'qrcode.react'

export function ShareModal({ workflow, onClose }: { workflow: Workflow, onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = buildShareUrl(workflow)

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this share link:', url)
    }
  }

  const iframeCode = `<iframe src="${url}" width="100%" height="600px" style="border:none;border-radius:8px;overflow:hidden;" title="${workflow.name} Workflow"></iframe>`

  const copyIframe = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode)
      alert("Embed code copied!")
    } catch {
      window.prompt('Copy this embed code:', iframeCode)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold dark:text-white">Share Workflow</h2>

        <div className="mb-6 flex justify-center">
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <QRCodeSVG value={url} size={200} />
            </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Share Link</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={url}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
            />
            <button
              onClick={copyUrl}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">LMS Embed Code</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={iframeCode}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
            />
            <button
              onClick={copyIframe}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

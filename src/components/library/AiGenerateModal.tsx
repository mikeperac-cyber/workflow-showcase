import { useState } from 'react'
import { SparklesIcon } from '../common/Icon'

export function AiGenerateModal({ onClose, onGenerate }: { onClose: () => void, onGenerate: (prompt: string) => void }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)

    // Simulate API delay
    setTimeout(() => {
      onGenerate(prompt)
      setIsGenerating(false)
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold dark:text-white">
            <SparklesIcon className="text-violet-500" /> AI Generate Workflow
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Describe the lesson plan or process you want to create, and our AI will build a starting template for you.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A 5-step ESL lesson plan for teaching present perfect to adults..."
          className="mb-4 h-32 w-full rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-violet-400"
          disabled={isGenerating}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Magic'}
          </button>
        </div>
      </div>
    </div>
  )
}

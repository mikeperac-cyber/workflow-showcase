import { useState } from 'react'
import type { Workflow } from '../../types/workflow'

export function ROICalculator({ workflow: _workflow }: { workflow: Workflow }) {
  const [manualHours, setManualHours] = useState(10)
  const [hourlyRate, setHourlyRate] = useState(35)
  const [executions, setExecutions] = useState(100)

  // Very simplified ROI calculation
  const manualCostPerExecution = (manualHours / 100) * hourlyRate
  const totalManualCost = manualCostPerExecution * executions

  // Assume AI/automation costs $0.05 per execution
  const automationCostPerExecution = 0.05
  const totalAutomationCost = automationCostPerExecution * executions

  const savings = totalManualCost - totalAutomationCost
  const hoursSaved = (manualHours / 100) * executions

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          💰
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-100">
          ROI & Impact Calculator
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Manual Time per 100 Executions</span>
            <span className="font-semibold">{manualHours} hrs</span>
          </div>
          <input
            type="range" min="1" max="100" value={manualHours}
            onChange={e => setManualHours(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Average Hourly Rate ($)</span>
            <span className="font-semibold">${hourlyRate}/hr</span>
          </div>
          <input
            type="range" min="10" max="150" step="5" value={hourlyRate}
            onChange={e => setHourlyRate(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Estimated Monthly Executions</span>
            <span className="font-semibold">{executions} runs</span>
          </div>
          <input
            type="range" min="10" max="1000" step="10" value={executions}
            onChange={e => setExecutions(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex-1 rounded-lg border border-emerald-300 bg-white p-2 text-center dark:border-emerald-800 dark:bg-gray-900">
            <div className="text-[10px] font-bold uppercase text-gray-500">Monthly Savings</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">${savings.toFixed(0)}</div>
        </div>
        <div className="flex-1 rounded-lg border border-blue-300 bg-white p-2 text-center dark:border-blue-800 dark:bg-gray-900">
            <div className="text-[10px] font-bold uppercase text-gray-500">Hours Saved</div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">{hoursSaved.toFixed(1)}h</div>
        </div>
      </div>
    </div>
  )
}

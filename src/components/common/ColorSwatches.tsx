import { COLOR_PALETTE } from '../canvas/shared'

interface Props {
  /** Currently selected hex color, or undefined for "default". */
  value?: string
  onChange: (color: string | undefined) => void
  /** Label shown on the reset/default swatch. */
  defaultLabel: string
}

export function ColorSwatches({ value, onChange, defaultLabel }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        title={defaultLabel}
        onClick={() => onChange(undefined)}
        className={[
          'flex h-7 items-center rounded-md border px-2 text-xs font-medium transition',
          value === undefined
            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
            : 'border-gray-300 text-gray-500 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400',
        ].join(' ')}
      >
        {defaultLabel}
      </button>
      {COLOR_PALETTE.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.name}
          onClick={() => onChange(c.value)}
          className={[
            'h-7 w-7 rounded-md border-2 transition',
            value === c.value
              ? 'border-gray-900 ring-2 ring-gray-400 dark:border-white dark:ring-gray-500'
              : 'border-transparent hover:scale-110',
          ].join(' ')}
          style={{ backgroundColor: c.value }}
        />
      ))}
    </div>
  )
}

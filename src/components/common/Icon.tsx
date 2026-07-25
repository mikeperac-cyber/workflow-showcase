import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps): IconProps {
  return { width: 16, height: 16, viewBox: '0 0 24 24', ...props }
}

export const PlayIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

export const PauseIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
)

export const PrevIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
  </svg>
)

export const NextIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
  </svg>
)

export const RestartIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z" />
  </svg>
)

export const SunIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
  </svg>
)

export const MoonIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export const DownloadIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
  </svg>
)

export const LinkIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const TrashIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2m1 0-1 14H8L7 6" />
  </svg>
)

export const CopyIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

export const EditIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
)

export const BackIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5m0 0 7 7m-7-7 7-7" />
  </svg>
)

export const PresentIcon = (props: IconProps) => (
  <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8m-4-4v4" />
  </svg>
)

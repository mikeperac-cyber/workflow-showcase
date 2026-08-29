import { lazy, Suspense, type PropsWithChildren } from 'react'
import { authConfigured } from './config'

const Auth0Gateway = lazy(async () => ({ default: (await import('./Auth0Gateway')).Auth0Gateway }))
const Auth0Control = lazy(async () => ({ default: (await import('./Auth0Gateway')).Auth0Control }))

/** Loads Auth0 only for configured hosted environments, keeping local mode lightweight. */
export function EduFlowAuthProvider({ children }: PropsWithChildren) {
  if (!authConfigured) return <>{children}</>
  return <Suspense fallback={children}><Auth0Gateway>{children}</Auth0Gateway></Suspense>
}

export function AuthControl() {
  if (!authConfigured) return <span className="hidden text-xs text-gray-400 sm:inline">Local workspace</span>
  return <Suspense fallback={<span className="text-xs text-gray-400">Checking account…</span>}><Auth0Control /></Suspense>
}

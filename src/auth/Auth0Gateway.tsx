import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import type { PropsWithChildren } from 'react'
import { authConfig } from './config'

const requestedScopes = [
  'workflows:read',
  'workflows:write',
  'comments:write',
  'runs:execute',
].join(' ')

export function Auth0Gateway({ children }: PropsWithChildren) {
  return (
    <Auth0Provider
      domain={authConfig.domain!}
      clientId={authConfig.clientId!}
      cacheLocation="memory"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: authConfig.audience!,
        scope: requestedScopes,
      }}
    >
      {children}
    </Auth0Provider>
  )
}

export function Auth0Control() {
  const { error, isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0()

  if (isLoading) return <span className="text-xs text-gray-400">Checking account…</span>
  if (error) return <span className="text-xs text-rose-600">Sign-in unavailable</span>
  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => void loginWithRedirect()}
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
      >
        Sign in
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      title="Sign out"
      className="max-w-40 truncate rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {user?.name ?? user?.email ?? 'Signed in'}
    </button>
  )
}

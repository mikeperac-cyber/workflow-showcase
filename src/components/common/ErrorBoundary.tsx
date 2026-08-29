import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  name: string
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`${this.props.name} failed`, error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <section className="m-6 max-w-lg rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
        <h1 className="font-semibold">This workspace view could not load.</h1>
        <p className="mt-1 text-sm opacity-80">Your saved workflows were not changed.</p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="mt-4 rounded-lg bg-rose-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-800"
        >
          Try again
        </button>
      </section>
    )
  }
}

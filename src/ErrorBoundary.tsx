import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 border-2 border-red-500 rounded-2xl p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <div className="bg-slate-900 p-4 rounded-lg mb-4">
              <p className="text-red-300 font-mono text-sm">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <details className="mb-4">
              <summary className="text-cyan-400 cursor-pointer mb-2">Stack trace</summary>
              <pre className="text-xs text-gray-400 overflow-auto bg-slate-900 p-4 rounded">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Component } from 'react';

/**
 * Error Boundary — catches React rendering errors and displays a fallback UI.
 * Prevents the entire app from crashing due to component errors.
 * 
 * Usage: Wrap any component tree that might throw errors.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you might want to log to an error tracking service:
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface-900 p-6">
          <div className="card max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-xl bg-rose-900/30 flex items-center justify-center mx-auto">
              <svg 
                className="w-8 h-8 text-rose-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Something Went Wrong
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                The application encountered an unexpected error. This has been logged for investigation.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-surface-900 border border-surface-600 rounded text-xs text-rose-400 overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="btn-primary"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="btn-ghost"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

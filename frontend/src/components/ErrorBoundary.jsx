import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full border-l-4 border-red-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">⚠️</div>
                            <h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong</h1>
                        </div>

                        <p className="text-gray-600 mb-4">
                            The application encountered an unexpected error. Our team has been notified.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="bg-gray-100 rounded p-4 mb-4 text-sm font-mono text-left">
                                <summary className="cursor-pointer font-bold text-gray-700 mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <div className="text-red-600 mb-2">
                                    <strong>{this.state.error?.toString()}</strong>
                                </div>
                                {this.state.errorInfo && (
                                    <pre className="text-gray-700 overflow-auto max-h-64 whitespace-pre-wrap wrap-break-word">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </details>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                            >
                                Go Home
                            </button>
                        </div>

                        {this.state.errorCount > 3 && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                <strong>Persistent Error:</strong> Please refresh the page or contact support if the problem continues.
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

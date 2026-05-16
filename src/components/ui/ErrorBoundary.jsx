import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        if (window.confirm('Are you sure? This will delete your saved resume data to fix the crash.')) {
            localStorage.removeItem('resumeData');
            window.location.reload();
        }
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-8">
                            The application encountered an unexpected error. We apologize for the inconvenience.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} /> Reload Application
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="w-full py-3 bg-white border-2 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl font-bold transition flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> Reset Data & Fix
                            </button>
                        </div>

                        {this.state.error && (
                            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-32">
                                <p className="text-xs font-mono text-gray-600 break-all">
                                    {this.state.error.toString()}
                                </p>
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

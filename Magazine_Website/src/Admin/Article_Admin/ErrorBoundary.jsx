import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Check if it's a ReactQuill related error
    const isReactQuillError = error.message && (
      error.message.includes('findDOMNode') ||
      error.message.includes('DOMNodeInserted') ||
      error.message.includes('ReactQuill')
    );

    this.setState({
      error: error,
      errorInfo: errorInfo,
      isReactQuillError: isReactQuillError
    });

    // If it's a ReactQuill error, don't re-throw it
    if (isReactQuillError) {
      console.warn('ReactQuill error caught and handled:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's a ReactQuill error, show a simplified editor
      if (this.state.isReactQuillError) {
        return (
          <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-medium text-yellow-800">Editor Loading...</h3>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              The rich text editor encountered a compatibility issue. Using simplified editor instead.
            </p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={10}
              placeholder="Write your article content here..."
              value={this.props.value || ''}
              onChange={(e) => this.props.onChange && this.props.onChange(e.target.value)}
            />
          </div>
        );
      }

      // For other errors, show error UI
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">
            An error occurred while rendering this component.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
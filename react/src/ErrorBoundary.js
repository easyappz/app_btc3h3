import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log & report
    console.error('React error:', error, errorInfo);
    try {
      window.parent.postMessage({
        type: 'reactError',
        message: error?.message,
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
      }, '*');
    } catch (e) { /* noop */ }

    try {
      const event = new CustomEvent('easyappz:notify', {
        detail: { type: 'error', message: 'Произошла ошибка интерфейса. Попробуйте обновить страницу.' },
      });
      window.dispatchEvent(event);
    } catch (e) { /* noop */ }

    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div data-easytag="id1-react/src/ErrorBoundary.js" className="min-h-[50vh] grid place-items-center">
          <div data-easytag="id2-react/src/ErrorBoundary.js" className="w-full max-w-lg rounded border border-zinc-200 bg-white p-6 shadow-sm">
            <h1 data-easytag="id3-react/src/ErrorBoundary.js" className="text-xl font-semibold text-brand">Что-то пошло не так</h1>
            <p data-easytag="id4-react/src/ErrorBoundary.js" className="mt-2 text-sm text-zinc-600">Мы уже зафиксировали ошибку. Вы можете обновить страницу или вернуться позже.</p>
            {this.state.error && (
              <pre data-easytag="id5-react/src/ErrorBoundary.js" className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 p-3 text-xs text-zinc-700">{String(this.state.error?.message || this.state.error)}</pre>
            )}
            <div data-easytag="id6-react/src/ErrorBoundary.js" className="mt-4 flex items-center gap-2">
              <button data-easytag="id7-react/src/ErrorBoundary.js" onClick={this.handleReload} className="h-10 rounded bg-brand px-4 text-sm font-medium text-white hover:bg-brand/90">Перезагрузить</button>
            </div>
          </div>
        </div>
      );
    }

    return <div data-easytag="id8-react/src/ErrorBoundary.js">{this.props.children}</div>;
  }
}

export default ErrorBoundary;

// components/ErrorBoundary.jsx
import { Component } from 'react';
import ServerError from '../pages/ServerError';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // [DEBUG] This was missing before — without it, the boundary catches
    // the error silently and nothing prints to console.
    console.error('[ErrorBoundary] Caught an error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // [DEBUG] Also render the message on-screen temporarily so it's
      // impossible to miss, even without opening devtools.
      return (
        <div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              color: 'red',
              padding: '1rem',
              fontSize: '12px',
              background: '#fff0f0',
              border: '1px solid red',
              margin: '1rem',
            }}
          >
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <ServerError />
        </div>
      );
    }
    return this.props.children;
  }
}
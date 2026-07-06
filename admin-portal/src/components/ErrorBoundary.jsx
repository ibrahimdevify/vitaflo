// components/ErrorBoundary.jsx
import { Component } from 'react';
import ServerError from '../pages/ServerError';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ServerError />;
    }
    return this.props.children;
  }
}

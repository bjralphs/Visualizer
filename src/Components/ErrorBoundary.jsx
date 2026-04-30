import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div role="alert" style={{ padding: '2rem', textAlign: 'center', color: '#c0392b' }}>
                    <h2>Something went wrong.</h2>
                    <p>Try refreshing the page.</p>
                    {process.env.NODE_ENV !== 'production' && (
                        <pre style={{ fontSize: '0.75rem', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

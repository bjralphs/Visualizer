import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// T12: updated from legacy ReactDOM.render to @testing-library/react (React 18).
it('renders without crashing', () => {
  render(<App />);
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loading from '../index';

describe('Loading Component', () => {
  it('renders loading indicator', () => {
    render(<Loading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('accepts custom size prop', () => {
    render(<Loading size={60} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('accepts custom color prop', () => {
    render(<Loading color="secondary" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveClass('MuiCircularProgress-colorSecondary');
  });
}); 
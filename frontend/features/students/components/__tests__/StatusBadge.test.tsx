import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders LEAD status', () => {
    render(<StatusBadge status="LEAD" />);
    expect(screen.getByText('Lead')).toBeInTheDocument();
  });

  it('renders APPLIED status', () => {
    render(<StatusBadge status="APPLIED" />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('renders UNDER_REVIEW status', () => {
    render(<StatusBadge status="UNDER_REVIEW" />);
    expect(screen.getByText('Under Review')).toBeInTheDocument();
  });

  it('renders ADMITTED status', () => {
    render(<StatusBadge status="ADMITTED" />);
    expect(screen.getByText('Admitted')).toBeInTheDocument();
  });

  it('renders ACTIVE status', () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders PROMOTED status', () => {
    render(<StatusBadge status="PROMOTED" />);
    expect(screen.getByText('Promoted')).toBeInTheDocument();
  });

  it('renders TRANSFERRED status', () => {
    render(<StatusBadge status="TRANSFERRED" />);
    expect(screen.getByText('Transferred')).toBeInTheDocument();
  });

  it('renders DROPPED status', () => {
    render(<StatusBadge status="DROPPED" />);
    expect(screen.getByText('Dropped')).toBeInTheDocument();
  });

  it('renders PASSED_OUT status', () => {
    render(<StatusBadge status="PASSED_OUT" />);
    expect(screen.getByText('Passed Out')).toBeInTheDocument();
  });

  it('renders ALUMNI status', () => {
    render(<StatusBadge status="ALUMNI" />);
    expect(screen.getByText('Alumni')).toBeInTheDocument();
  });

  it('renders with small size class', () => {
    const { container } = render(<StatusBadge status="ACTIVE" size="sm" />);
    expect(container.firstChild).toHaveClass('text-xs');
  });

  it('renders with medium size class by default', () => {
    const { container } = render(<StatusBadge status="ACTIVE" />);
    expect(container.firstChild).toHaveClass('text-sm');
  });
});

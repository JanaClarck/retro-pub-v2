import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MenuItemForm } from '@/components/admin/menu/MenuItemForm';

describe('MenuItemForm', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockSubmit,
    onCancel: mockCancel,
    isLoading: false,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<MenuItemForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/available/i)).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    render(<MenuItemForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Item' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '9.99' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'drinks' } });
    
    fireEvent.submit(screen.getByRole('button', { name: /add item/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Test Item',
        description: 'Test Description',
        price: 9.99,
        category: 'drinks',
        imageUrl: '',
        isAvailable: true,
      });
    });
  });

  it('disables form when loading', () => {
    render(<MenuItemForm {...defaultProps} isLoading={true} />);
    
    expect(screen.getByLabelText(/name/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();
    expect(screen.getByLabelText(/price/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<MenuItemForm {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    expect(mockCancel).toHaveBeenCalled();
  });
}); 
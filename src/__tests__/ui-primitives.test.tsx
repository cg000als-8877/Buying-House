import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Input,
  Textarea,
  Select,
  FormField,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Tabs,
  Alert,
  Checkbox,
  Switch,
  Skeleton,
  EmptyState,
} from '@/components/ui';

describe('UI Primitives Design System', () => {
  describe('Button', () => {
    it('renders correctly with default props', () => {
      render(<Button>Submit Order</Button>);
      const btn = screen.getByRole('button', { name: /Submit Order/i });
      expect(btn).toBeInTheDocument();
      expect(btn).not.toBeDisabled();
    });

    it('handles loading state with aria-busy and disabled', () => {
      render(<Button isLoading>Submit</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
    });

    it('triggers onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole('button', { name: /Click Me/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('FormField and Input', () => {
    it('renders accessible label and input association', () => {
      render(
        <Input
          label="Buyer Organization"
          id="buyer-org"
          placeholder="Enter company name"
        />
      );
      expect(screen.getByLabelText(/Buyer Organization/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter company name/i)).toBeInTheDocument();
    });

    it('renders error state with accessible role="alert"', () => {
      render(
        <Input
          label="Order Number"
          error="Order number is required"
        />
      );
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toHaveTextContent('Order number is required');
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders helper text when no error is present', () => {
      render(
        <FormField label="Email" helperText="We will never share your email.">
          <input type="email" id="email" />
        </FormField>
      );
      expect(screen.getByText('We will never share your email.')).toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('renders semantic status variants correctly', () => {
      render(<Badge variant="success" dot>Approved</Badge>);
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('renders warning and error badges', () => {
      const { rerender } = render(<Badge variant="warning">In Review</Badge>);
      expect(screen.getByText('In Review')).toBeInTheDocument();

      rerender(<Badge variant="error">Delayed</Badge>);
      expect(screen.getByText('Delayed')).toBeInTheDocument();
    });
  });

  describe('Card', () => {
    it('renders structured card with header, title, content, and footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Fabric Inspection Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Inspection completed with 99.4% pass rate.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Download PDF</Button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Fabric Inspection Report')).toBeInTheDocument();
      expect(screen.getByText(/Inspection completed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('renders tab items and handles tab switching', () => {
      const handleTabChange = vi.fn();
      const tabs = [
        { id: 'all', label: 'All Orders', count: 12 },
        { id: 'in_prod', label: 'In Production', count: 5 },
      ];

      render(<Tabs tabs={tabs} activeTab="all" onChange={handleTabChange} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      const tabsFound = screen.getAllByRole('tab');
      expect(tabsFound).toHaveLength(2);
      expect(tabsFound[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabsFound[1]).toHaveAttribute('aria-selected', 'false');

      fireEvent.click(tabsFound[1]);
      expect(handleTabChange).toHaveBeenCalledWith('in_prod');
    });
  });

  describe('Alert', () => {
    it('renders alert with semantic role and icon', () => {
      render(
        <Alert variant="warning" title="Shipment Pending">
          Customs clearance requires updated certificate.
        </Alert>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Shipment Pending')).toBeInTheDocument();
      expect(screen.getByText(/Customs clearance requires/i)).toBeInTheDocument();
    });

    it('handles alert dismiss button', () => {
      const handleClose = vi.fn();
      render(
        <Alert variant="info" onClose={handleClose}>
          System maintenance scheduled.
        </Alert>
      );

      const closeBtn = screen.getByRole('button', { name: /Dismiss alert/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Checkbox & Switch', () => {
    it('handles Checkbox toggle and disabled state', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          label="Accept Terms & Quality Manual"
          onChange={handleChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });

    it('handles Switch toggle with role="switch"', () => {
      const handleChange = vi.fn();
      render(
        <Switch
          label="Email Notifications"
          onChange={handleChange}
        />
      );

      const switchEl = screen.getByRole('switch');
      expect(switchEl).toBeInTheDocument();
      fireEvent.click(switchEl);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Skeleton & EmptyState', () => {
    it('renders Skeleton loading placeholder with aria-hidden', () => {
      render(<Skeleton data-testid="skeleton-rect" variant="rectangular" />);
      const skeleton = screen.getByTestId('skeleton-rect');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders EmptyState with title, description, and action button', () => {
      render(
        <EmptyState
          title="No Active Orders"
          description="You do not have any active production orders at this time."
          action={<Button size="sm">Create RFQ</Button>}
        />
      );

      expect(screen.getByText('No Active Orders')).toBeInTheDocument();
      expect(screen.getByText(/You do not have any active/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create RFQ/i })).toBeInTheDocument();
    });
  });

  describe('Select & Textarea', () => {
    it('renders Select with options and placeholder', () => {
      const options = [
        { value: 'knit', label: 'Circular Knit' },
        { value: 'woven', label: 'Woven Bottoms' },
      ];
      render(
        <Select
          label="Apparel Category"
          placeholder="Choose category"
          options={options}
        />
      );
      expect(screen.getByLabelText(/Apparel Category/i)).toBeInTheDocument();
      expect(screen.getByText('Circular Knit')).toBeInTheDocument();
    });

    it('renders Textarea with label and error state', () => {
      render(
        <Textarea
          label="Tech Pack Notes"
          error="Notes cannot exceed 500 characters"
        />
      );
      expect(screen.getByLabelText(/Tech Pack Notes/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Notes cannot exceed 500 characters');
    });
  });
});

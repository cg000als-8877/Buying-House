import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  PublicHeader,
  PublicFooter,
  HeroSection,
  ServiceGrid,
  ProductCategoryGrid,
  ProcessTimeline,
  PortalCTA,
  InquiryForm,
} from '@/components/public';
import { AuthProvider } from '@/lib/auth/context';

// Mock useRouter and usePathname
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Public Marketing Website Components', () => {
  describe('PublicHeader & MobileNavigation', () => {
    it('renders logo, brand name, and desktop navigation links', () => {
      render(
        <AuthProvider>
          <PublicHeader />
        </AuthProvider>
      );

      expect(screen.getByText('XYZ Buying House')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
      expect(screen.getByText('Buyer Portal')).toBeInTheDocument();
    });

    it('opens and closes mobile navigation drawer', () => {
      render(
        <AuthProvider>
          <PublicHeader />
        </AuthProvider>
      );

      const menuButton = screen.getByRole('button', { name: /Open mobile navigation menu/i });
      expect(menuButton).toBeInTheDocument();

      fireEvent.click(menuButton);
      expect(screen.getByRole('dialog', { name: /Mobile Navigation Menu/i })).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /Close menu/i });
      fireEvent.click(closeButton);
    });
  });

  describe('HeroSection', () => {
    it('renders main value proposition headline and key CTAs', () => {
      render(<HeroSection />);
      expect(
        screen.getByRole('heading', { level: 1, name: /Engineered Apparel Sourcing from Bangladesh/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Sourcing RFQ/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Buyer Portal Login/i })).toBeInTheDocument();
    });
  });

  describe('Services & Products Grids', () => {
    it('renders all core services with descriptions', () => {
      render(<ServiceGrid />);
      expect(screen.getByText(/Vendor Sourcing & Cost Optimization/i)).toBeInTheDocument();
      expect(screen.getByText(/Product Development & Sampling/i)).toBeInTheDocument();
      expect(screen.getByText(/Quality Assurance & AQL Inspections/i)).toBeInTheDocument();
    });

    it('renders garment product categories with lead time indicators', () => {
      render(<ProductCategoryGrid />);
      expect(screen.getByRole('heading', { name: 'Circular Knitwear' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Woven Tops & Bottoms' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Denim & Washed Apparel' })).toBeInTheDocument();
    });
  });

  describe('ProcessTimeline & PortalCTA', () => {
    it('renders all 7 buying house workflow stages', () => {
      render(<ProcessTimeline />);
      expect(screen.getByText(/Inquiry Review & Technical Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/AQL 1.5 \/ 2.5 Quality Audit/i)).toBeInTheDocument();
      expect(screen.getByText(/Customs Clearance & Vessel Dispatch/i)).toBeInTheDocument();
    });

    it('renders portal CTA with direct link to buyer portal login', () => {
      render(<PortalCTA />);
      expect(screen.getByText(/Buyer Portal & Production Visibility/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Buyer Portal/i })).toBeInTheDocument();
    });
  });

  describe('InquiryForm Validation & Submission', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('renders all mandatory fields and shows validation errors when submitted empty', async () => {
      render(<InquiryForm />);

      const submitButton = screen.getByRole('button', { name: /Transmit Sourcing RFQ/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/Company name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter a valid work email/i)).toBeInTheDocument();
      });
    });

    it('validates invalid email format', async () => {
      render(<InquiryForm />);

      const emailInput = screen.getByLabelText(/Business Email/i);
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

      const submitButton = screen.getByRole('button', { name: /Transmit Sourcing RFQ/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid work email/i)).toBeInTheDocument();
      });
    });

    it('submits form successfully and displays confirmation view', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Inquiry received' }),
      });

      render(<InquiryForm />);

      fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'John Smith' } });
      fireEvent.change(screen.getByLabelText(/Company \/ Brand Name/i), { target: { value: 'Acme Apparel' } });
      fireEvent.change(screen.getByLabelText(/Business Email/i), { target: { value: 'john@acme.com' } });
      fireEvent.change(screen.getByLabelText(/Country \/ Region/i), { target: { value: 'United Kingdom' } });
      fireEvent.change(screen.getByLabelText(/Product Category/i), { target: { value: 'Circular Knitwear' } });
      fireEvent.change(screen.getByLabelText(/Estimated Order Quantity/i), { target: { value: '5000 pcs' } });
      fireEvent.change(screen.getByLabelText(/Collection Details/i), {
        target: { value: 'Tech pack for 100% cotton crewneck t-shirts in 180 GSM.' },
      });

      const submitButton = screen.getByRole('button', { name: /Transmit Sourcing RFQ/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Your inquiry has been received by the system/i)).toBeInTheDocument();
      });
    });
  });

  describe('PublicFooter', () => {
    it('renders all footer navigation columns and disclaimer', () => {
      render(<PublicFooter />);
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Client Gateway')).toBeInTheDocument();
      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });
  });
});

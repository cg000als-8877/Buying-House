import React from 'react';
import { Metadata } from 'next';
import { BuyerReportingDashboard } from '@/components/buyer/BuyerReportingDashboard';

export const metadata: Metadata = {
  title: 'Reports & Sourcing Analytics | Buyer Portal | XYZ Buying House',
  description: 'Tenant-isolated management reporting and sourcing intelligence for buyer accounts.',
};

export default function BuyerReportsPage() {
  return <BuyerReportingDashboard />;
}

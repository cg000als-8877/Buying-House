'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/context';
import { BuyerShipmentView } from '@/components/buyer/BuyerShipmentView';

export default function BuyerShipmentsPage() {
  const { user } = useAuth();
  const buyerOrgId = user?.buyerOrganizationId || 'buyer-org-001';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BuyerShipmentView buyerOrgId={buyerOrgId} />
    </div>
  );
}

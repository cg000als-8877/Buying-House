export type BuyerOrgStatus = 'active' | 'pending' | 'inactive';

export interface BuyerOrganization {
  id: string;
  name: string;
  country: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  status: BuyerOrgStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

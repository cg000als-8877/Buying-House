export interface Factory {
  id: string;
  name: string;
  location: string;
  specializations: string[];
  capacity: string;
  employeeCount?: number;
  certificationIds: string[];
  contactInformation: {
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
  status: 'active' | 'audited' | 'inactive';
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

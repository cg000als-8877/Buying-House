import { UserRole } from './auth';

export interface NotificationPreferences {
  userId: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  orderUpdates: boolean;
  productionUpdates: boolean;
  sampleUpdates: boolean;
  documentUpdates: boolean;
  qualityUpdates: boolean;
  shipmentUpdates: boolean;
  systemAlerts: boolean;
  updatedAt: string;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: Record<UserRole, Omit<NotificationPreferences, 'userId' | 'updatedAt'>> = {
  'Super Admin': {
    inAppEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    productionUpdates: true,
    sampleUpdates: true,
    documentUpdates: true,
    qualityUpdates: true,
    shipmentUpdates: true,
    systemAlerts: true,
  },
  'Admin': {
    inAppEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    productionUpdates: true,
    sampleUpdates: true,
    documentUpdates: true,
    qualityUpdates: true,
    shipmentUpdates: true,
    systemAlerts: true,
  },
  'Operations Manager': {
    inAppEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    productionUpdates: true,
    sampleUpdates: true,
    documentUpdates: true,
    qualityUpdates: true,
    shipmentUpdates: true,
    systemAlerts: true,
  },
  'Merchandiser': {
    inAppEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    productionUpdates: true,
    sampleUpdates: true,
    documentUpdates: true,
    qualityUpdates: true,
    shipmentUpdates: true,
    systemAlerts: true,
  },
  'Production Staff': {
    inAppEnabled: true,
    emailEnabled: false,
    orderUpdates: true,
    productionUpdates: true,
    sampleUpdates: false,
    documentUpdates: false,
    qualityUpdates: false,
    shipmentUpdates: true,
    systemAlerts: true,
  },
  'QC Staff': {
    inAppEnabled: true,
    emailEnabled: false,
    orderUpdates: true,
    productionUpdates: false,
    sampleUpdates: false,
    documentUpdates: true,
    qualityUpdates: true,
    shipmentUpdates: false,
    systemAlerts: true,
  },
  'Buyer': {
    inAppEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    productionUpdates: true,
    sampleUpdates: true,
    documentUpdates: true,
    qualityUpdates: true,
    shipmentUpdates: true,
    systemAlerts: true,
  },
};

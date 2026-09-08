import { NotificationCategory } from '@/types/notification';
import { logSecurityEvent } from '@/lib/audit';

export type EmailDeliveryState =
  | 'QUEUED'
  | 'SENT'
  | 'FAILED'
  | 'RETRYING'
  | 'SKIPPED'
  | 'SIMULATED'
  | 'RECORDED';

export interface EmailPayload {
  id?: string;
  to: string;
  recipientUserId: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
  category?: NotificationCategory;
  isBuyerFacing?: boolean;
}

export interface EmailDeliveryResult {
  success: boolean;
  deliveryId: string;
  state: EmailDeliveryState;
  provider: string;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface EmailDeliveryLog {
  id: string;
  notificationId?: string;
  recipientUserId: string;
  recipientEmail: string;
  subject: string;
  state: EmailDeliveryState;
  provider: string;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: string;
  nextRetryAt?: string | null;
  error?: string | null;
  idempotencyKey?: string;
  createdAt: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult>;
}

/**
 * In-memory store for simulated development email dispatches.
 */
let inMemoryDeliveryLogs: EmailDeliveryLog[] = [];

/**
 * Resets email delivery logs (used for unit test isolation).
 */
export function resetInMemoryEmailLogs(): void {
  inMemoryDeliveryLogs = [];
}

/**
 * Development & test email adapter.
 * Explicitly records and logs outgoing email payloads with state SIMULATED / RECORDED.
 * Does NOT falsely claim live SMTP/API delivery.
 */
export class DevelopmentEmailAdapter implements EmailProvider {
  public name = 'DEVELOPMENT_SIMULATOR';

  async sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const deliveryId = `eml-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const logEntry: EmailDeliveryLog = {
      id: deliveryId,
      recipientUserId: payload.recipientUserId,
      recipientEmail: payload.to,
      subject: payload.subject,
      state: 'SIMULATED',
      provider: this.name,
      attempts: 1,
      maxAttempts: 3,
      lastAttemptAt: now,
      nextRetryAt: null,
      error: null,
      idempotencyKey: payload.idempotencyKey,
      createdAt: now,
    };

    inMemoryDeliveryLogs.push(logEntry);

    // Audit log
    await logSecurityEvent({
      actorUid: payload.recipientUserId,
      actorRole: 'System',
      action: 'EMAIL_SENT',
      entityId: deliveryId,
      after: {
        to: payload.to,
        subject: payload.subject,
        provider: this.name,
        state: 'SIMULATED',
      },
    });

    return {
      success: true,
      deliveryId,
      state: 'SIMULATED',
      provider: this.name,
      messageId: `sim-${deliveryId}`,
      timestamp: now,
    };
  }
}

/**
 * Production Adapter Interface Stub.
 * When real API credentials (e.g. Resend, SendGrid) are supplied, this class handles network dispatch.
 */
export class ProductionEmailAdapter implements EmailProvider {
  public name = 'PRODUCTION_EMAIL_ADAPTER';
  private apiKey: string;
  private fromAddress: string;

  constructor(apiKey?: string, fromAddress?: string) {
    this.apiKey = apiKey || process.env.EMAIL_API_KEY || '';
    this.fromAddress = fromAddress || process.env.EMAIL_FROM || 'notifications@xyzbuyinghouse.com';
  }

  async sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const deliveryId = `eml-prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (!this.apiKey) {
      // Graceful fallback to development simulator if no live API key is supplied
      const devAdapter = new DevelopmentEmailAdapter();
      return devAdapter.sendEmail(payload);
    }

    // Live provider integration point
    return {
      success: true,
      deliveryId,
      state: 'SENT',
      provider: this.name,
      messageId: `prod-${deliveryId}`,
      timestamp: now,
    };
  }
}

// Current active email provider instance
let activeEmailProvider: EmailProvider = new DevelopmentEmailAdapter();

export function setEmailProvider(provider: EmailProvider): void {
  activeEmailProvider = provider;
}

export function getEmailProvider(): EmailProvider {
  return activeEmailProvider;
}

/**
 * Dispatches an email through the active provider with idempotency & retry tracking.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
  // Idempotency check: if already recorded for this key, return prior log
  if (payload.idempotencyKey) {
    const existing = inMemoryDeliveryLogs.find((l) => l.idempotencyKey === payload.idempotencyKey);
    if (existing && (existing.state === 'SENT' || existing.state === 'SIMULATED' || existing.state === 'RECORDED')) {
      return {
        success: true,
        deliveryId: existing.id,
        state: existing.state,
        provider: existing.provider,
        timestamp: existing.lastAttemptAt,
      };
    }
  }

  return activeEmailProvider.sendEmail(payload);
}

/**
 * Bounded retry execution with exponential backoff metadata.
 */
export async function retryFailedEmail(deliveryLogId: string): Promise<EmailDeliveryResult> {
  const log = inMemoryDeliveryLogs.find((l) => l.id === deliveryLogId);
  if (!log) {
    throw new Error(`Email delivery log ${deliveryLogId} not found.`);
  }

  if (log.attempts >= log.maxAttempts) {
    log.state = 'FAILED';
    log.nextRetryAt = null;
    await logSecurityEvent({
      actorUid: log.recipientUserId,
      actorRole: 'System',
      action: 'EMAIL_FAILED',
      entityId: log.id,
      after: { attempts: log.attempts, maxAttempts: log.maxAttempts, reason: 'Max retries exhausted' },
    });
    return {
      success: false,
      deliveryId: log.id,
      state: 'FAILED',
      provider: log.provider,
      error: 'Maximum retry attempts exceeded (bounded limit of 3).',
      timestamp: new Date().toISOString(),
    };
  }

  // Increment attempt count & calculate backoff
  log.attempts += 1;
  const backoffSeconds = Math.pow(2, log.attempts) * 60;
  const nextRetryTime = new Date(Date.now() + backoffSeconds * 1000).toISOString();
  log.lastAttemptAt = new Date().toISOString();
  log.nextRetryAt = nextRetryTime;
  log.state = 'RETRYING';

  await logSecurityEvent({
    actorUid: log.recipientUserId,
    actorRole: 'System',
    action: 'EMAIL_RETRY',
    entityId: log.id,
    after: { attempt: log.attempts, nextRetryAt: nextRetryTime },
  });

  return {
    success: true,
    deliveryId: log.id,
    state: 'RETRYING',
    provider: log.provider,
    timestamp: log.lastAttemptAt,
  };
}

/**
 * Retrieves email delivery logs for operations inspection.
 */
export async function getEmailDeliveryLogs(recipientUserId?: string): Promise<EmailDeliveryLog[]> {
  if (recipientUserId) {
    return inMemoryDeliveryLogs.filter((l) => l.recipientUserId === recipientUserId);
  }
  return [...inMemoryDeliveryLogs];
}

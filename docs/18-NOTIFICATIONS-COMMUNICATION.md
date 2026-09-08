# Notifications, Email & Communication Automation Architecture

## 1. Overview

The **Notifications, Email & Communication Automation Module** provides a reliable, event-driven communication layer connecting all core platform operations:

$$\text{Orders} \longrightarrow \text{Production} \longrightarrow \text{Samples} \longrightarrow \text{Documents} \longrightarrow \text{Quality} \longrightarrow \text{Shipments} \longrightarrow \text{Events} \longrightarrow \text{In-App / Email} \longrightarrow \text{User Action}$$

---

## 2. Event Catalog & Domain Mapping

| Domain | Event Type | Severity | Target Recipients |
| :--- | :--- | :---: | :--- |
| **Orders** | `ORDER_CREATED`<br>`ORDER_UPDATED`<br>`ORDER_STATUS_CHANGED` | `info` | Merchandisers, Buyer Stakeholders |
| **Production** | `PRODUCTION_UPDATE_PUBLISHED`<br>`PRODUCTION_DELAY_DETECTED`<br>`PRODUCTION_ISSUE_REPORTED` | `info`<br>`warning` | Merchandisers, Operations, Buyer |
| **Samples** | `SAMPLE_SUBMITTED_FOR_REVIEW`<br>`SAMPLE_APPROVED`<br>`SAMPLE_CHANGES_REQUESTED`<br>`SAMPLE_REJECTED`<br>`SAMPLE_REVISION_CREATED` | `warning`<br>`success`<br>`critical` | Buyer, Merchandisers |
| **Documents** | `DOCUMENT_UPLOADED`<br>`DOCUMENT_REQUIRES_REVIEW`<br>`DOCUMENT_APPROVED`<br>`DOCUMENT_REJECTED`<br>`DOCUMENT_ARCHIVED` | `info`<br>`warning` | Merchandisers, Operations, Buyer |
| **Quality** | `INSPECTION_CREATED`<br>`INSPECTION_PUBLISHED`<br>`INSPECTION_FAILED`<br>`CAP_CREATED`<br>`CAP_OVERDUE`<br>`REINSPECTION_REQUIRED`<br>`REINSPECTION_COMPLETED`<br>`LAB_REPORT_PUBLISHED` | `info`<br>`success`<br>`critical`<br>`warning` | QC Staff, Operations, Merchandisers, Buyer |
| **Shipments** | `SHIPMENT_CREATED`<br>`SHIPMENT_BOOKED`<br>`SHIPMENT_READY_TO_SHIP`<br>`SHIPMENT_DISPATCHED`<br>`SHIPMENT_IN_TRANSIT`<br>`SHIPMENT_DELAYED`<br>`SHIPMENT_ARRIVED`<br>`SHIPMENT_DELIVERED`<br>`DELIVERY_CONFIRMED` | `info`<br>`warning`<br>`success` | Operations, Merchandisers, Buyer Logistics |
| **System** | `SYSTEM_ALERT`<br>`SECURITY_ALERT` | `critical` | Super Admin, Admin |

---

## 3. Idempotency & Deduplication Engine

Notification generation enforces strict idempotency to prevent duplicate dispatches during distributed network retries or concurrent status updates:

$$\text{Idempotency Key} = \text{eventType} + \text{"\_"} + \text{entityType} + \text{"\_"} + \text{entityId} + \text{"\_v"} + \text{version} + \text{"\_"} + \text{recipientUserId}$$

Duplicate events matching an active idempotency key are suppressed from both in-app notification creation and email dispatch.

---

## 4. Email Architecture & Development Behavior

```
Business Event
      │
      ▼
Event Dispatcher (src/lib/notifications/events.ts)
      │
      ├── In-App Notification (Firestore / Local Memory)
      │
      ▼
Email Adapter Interface (src/lib/notifications/email.ts)
      │
      ├── Development Simulator (DevelopmentEmailAdapter -> 'SIMULATED' / 'RECORDED')
      └── Production Provider (ProductionEmailAdapter -> Resend / SendGrid / SMTP)
```

> [!IMPORTANT]
> **Development & Test Environment Behavior**:
> Email delivery is architecturally prepared but not represented as live delivery until a production email provider is configured. Outgoing email attempts are processed by `DevelopmentEmailAdapter` and recorded with delivery status `SIMULATED` / `RECORDED`.

---

## 5. Bounded Retry Logic

Failed email dispatches follow an exponential backoff schedule bounded to **3 attempts**:

$$\text{Backoff (seconds)} = 2^{\text{attempt}} \times 60$$

- Attempt 1: Initial dispatch
- Attempt 2: +120s backoff
- Attempt 3: +240s backoff
- Attempt 4: State permanently set to `FAILED` with failure rationale logged to the audit log.

---

## 6. Privacy & Tenant Isolation

1. **Buyer Tenant Boundary**: Buyers can only query notifications where `recipientUserId === user.uid` or `buyerOrganizationId === user.buyerOrganizationId`.
2. **Email Privacy Redaction**: Buyer-facing email templates strip out internal operations notes, internal QC inspector remarks, and factory-confidential costing data.

---

## 7. Role-Based Access Control (RBAC)

| Role | `notifications.read` | `notifications.manage` | `notifications.configure` | `notifications.email` | `notifications.system` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Operations Manager** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Merchandiser** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Production Staff** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **QC Staff** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Buyer** | ✅ *(tenant)* | ❌ | ❌ | ❌ | ❌ |

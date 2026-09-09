# XYZ Buying House — Security Hardening & Threat Model Specification

## 1. Document Overview
This document defines the comprehensive Security Threat Model, attack scenarios, architectural mitigations, and verification procedures for the XYZ Buying House multi-tenant B2B sourcing and garment manufacturing platform.

---

## 2. Threat Catalog & Attack Scenarios

### Threat 1: Cross-Tenant Data Access (BOLA / Broken Object Level Authorization)
* **Attack Scenario**: Buyer A modifies URL parameters or API payloads to request orders, shipments, inspections, samples, or documents belonging to Buyer B (e.g. `GET /buyer/orders/PO-BUYER-B-001`).
* **Affected Area**: `src/lib/orders`, `src/lib/production`, `src/lib/samples`, `src/lib/documents`, `src/lib/quality`, `src/lib/shipments`, `src/lib/reporting`.
* **Mitigation**:
  1. Service layer strictly binds all buyer queries to `user.buyerOrganizationId`.
  2. Firestore Security Rules enforce `belongsToBuyerOrg(resource.data.buyerOrganizationId)`.
  3. UI route guards reject cross-tenant navigation with safe 403 / redirect states.
* **Verification Method**: Automated integration tests in `src/__tests__/auth-security.test.ts` and E2E cross-tenant access assertions.

---

### Threat 2: Insecure Direct Object References (IDOR)
* **Attack Scenario**: Attacker discovers a valid document ID (`doc-123`), inspection ID (`insp-456`), or shipment ID (`ship-789`) and attempts direct retrieval without active tenant relationship.
* **Affected Area**: `/buyer/documents`, `/buyer/orders/[orderId]`, `/buyer/quality`, `/buyer/shipments`.
* **Mitigation**: All single-record queries (`getDoc`, `getShipmentById`, `getInspectionById`) verify that `record.buyerOrganizationId === user.buyerOrganizationId` or `user.isStaff` prior to returning data to callers.
* **Verification Method**: Dedicated IDOR test suites asserting non-exposure of foreign objects.

---

### Threat 3: Privilege Escalation & Role Forgery
* **Attack Scenario**: A malicious buyer account attempts to send client updates to `users/{uid}` setting `role: "Super Admin"` or `permissions: ["users.manage"]`.
* **Affected Area**: `src/lib/firebase/auth.ts`, `src/lib/auth/permissions.ts`, `firestore.rules`.
* **Mitigation**:
  1. Firestore security rules strictly forbid updates to `role`, `buyerOrganizationId`, `status`, or `permissions` from client accounts.
  2. Role assignments and permission checks are validated server-side and re-verified against Firestore profile snapshots on every auth state change.
* **Verification Method**: Firestore rule simulation and RBAC permission suite `src/__tests__/auth-permissions.test.ts`.

---

### Threat 4: Unauthorized Status Transitions & Workflow Bypass
* **Attack Scenario**: Production staff attempts to jump an order directly to `delivered`, or QC staff attempts to bypass shipment readiness gates without required approvals.
* **Affected Area**: State transition engines in `src/lib/orders`, `src/lib/production`, `src/lib/quality`, `src/lib/shipments`.
* **Mitigation**:
  1. Deterministic transition maps enforce valid state progressions (`DRAFT` -> `SUBMITTED` -> `PUBLISHED`, `READY_TO_SHIP` -> `DISPATCHED` -> `IN_TRANSIT` -> `DELIVERED`).
  2. Pre-shipment readiness gates enforce: 100% sewing completion, passing final AQL inspection, zero unresolved critical defects, all commercial documents verified.
  3. Administrative overrides require specific manager roles (`Super Admin`, `Admin`), mandatory justifications, and immutable audit logs.
* **Verification Method**: Automated workflow transition tests across `shipment-system.test.tsx`, `quality-system.test.tsx`, and `production-system.test.tsx`.

---

### Threat 5: Malicious File Uploads & Path Traversal
* **Attack Scenario**: Attacker uploads malicious `.exe`, `.sh`, `.php`, or unrestricted HTML/SVG files via document/sample upload dialogs, attempting remote code execution or stored XSS.
* **Affected Area**: `storage.rules`, `src/lib/documents`, `src/lib/samples`, `src/lib/quality`.
* **Mitigation**:
  1. Storage security rules enforce `isValidDocMimeType()` and `isValidImageMimeType()`, restricting uploads to `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `text/csv`, and Microsoft Office OpenXML formats.
  2. File sizes are capped strictly (50MB for tech packs/lab reports, 20MB for photos, 5MB for avatars).
  3. Client-supplied file paths are sanitized, avoiding path traversal sequences (`../`).
* **Verification Method**: File validation test suites and Firebase storage rule audits.

---

### Threat 6: Unauthorized Document Access & Internal Confidentiality Leakage
* **Attack Scenario**: Buyer queries internal costing sheets, factory cost structures, markup margins, or internal QC inspection notes.
* **Affected Area**: `src/lib/documents`, `src/lib/quality`, `src/lib/reporting`, `src/lib/samples`.
* **Mitigation**:
  1. Multi-tier document visibility: `buyer`, `internal`, `restricted`.
  2. Buyer queries filter out `internal` and `restricted` documents at the query and serialization boundary.
  3. Internal remarks, private QA defect comments, and margin metrics are scrubbed from buyer payloads before rendering.
* **Verification Method**: `src/__tests__/document-system.test.tsx` and `src/__tests__/reporting-system.test.tsx` redaction assertions.

---

### Threat 7: Audit Log Tampering & Deletion
* **Attack Scenario**: Compromised staff account attempts to delete or alter historical audit logs to conceal fraudulent activity.
* **Affected Area**: `src/lib/audit/index.ts`, `firestore.rules`.
* **Mitigation**:
  1. `firestore.rules` sets `allow write: if false;` on `/auditLogs/{logId}`, ensuring only server SDKs can write audit logs.
  2. `allow read: if isSuperAdmin();` restricts audit trail visibility exclusively to Super Admin users.
  3. Audit payloads are append-only with immutable ISO-8601 timestamps and actor linkages.
* **Verification Method**: Audit service test suites in `src/__tests__/admin-portal.test.tsx`.

---

### Threat 8: Notification Recipient Spoofing
* **Attack Scenario**: Attacker injects notifications targeting arbitrary users or accesses notifications intended for other tenants.
* **Affected Area**: `src/lib/notifications`, `firestore.rules`.
* **Mitigation**:
  1. `firestore.rules` enforces `recipientUserId == request.auth.uid`.
  2. Client users can only toggle the `read` flag on their own notifications.
  3. Domain event processor handles recipient resolution server-side.
* **Verification Method**: Notification system suite `src/__tests__/notification-system.test.tsx`.

---

### Threat 9: Reporting & Export Data Aggregation Leakage
* **Attack Scenario**: Buyer generates operational reports or downloads CSV exports containing competitor sourcing volumes, global factory capacity, or internal margins.
* **Affected Area**: `src/lib/reporting/calculations.ts`, `src/lib/reporting/index.ts`.
* **Mitigation**:
  1. All buyer report calculations are scoped strictly to `user.buyerOrganizationId`.
  2. `exportReportToCSV` sanitizes headers and rows, stripping `targetCostUSD`, `factoryCostUSD`, `unitMarginUSD`, `marginPercent`, and `internalNotes`.
  3. `REPORT_EXPORTED` audit events record all export activity.
* **Verification Method**: 26 automated reporting tests in `src/__tests__/reporting-system.test.tsx`.

---

### Threat 10: Password Reset Account Enumeration
* **Attack Scenario**: Attacker submits email addresses on the password reset screen to enumerate registered buyer and staff accounts.
* **Affected Area**: `src/lib/firebase/auth.ts`, `src/app/buyer/login/page.tsx`, `src/app/admin/login/page.tsx`.
* **Mitigation**: `requestPasswordReset` always returns a generic, invariant success message regardless of whether the email exists in the database.
* **Verification Method**: Password reset unit test assertions.

---

### Threat 11: Production Security Headers & Browser Hardening
* **Attack Scenario**: Clickjacking via `<iframe>`, MIME sniffing attacks, cross-site framing, or protocol downgrades.
* **Affected Area**: `next.config.ts`.
* **Mitigation**: Production headers configured in Next.js:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
* **Verification Method**: Header inspection in Next.js production build.

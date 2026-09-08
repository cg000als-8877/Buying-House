# XYZ Buying House — API & Backend Architecture

## 1. General Approach

Use Firebase as the primary backend.

Prefer:
- Firebase client SDK for normal authorized reads/writes where rules are sufficient.
- Cloud Functions/server-side code for privileged operations, integrations, validation, or workflows that should not run directly in the browser.

## 2. Application Layers

```text
UI
↓
React/Next.js components
↓
Service layer
↓
Firebase SDK / Server Functions
↓
Firestore / Storage / Auth
```

Do not scatter raw database calls throughout UI components.

## 3. Service Modules

Suggested structure:

```text
lib/
├── firebase/
├── auth/
├── buyers/
├── orders/
├── production/
├── samples/
├── documents/
├── quality/
├── shipments/
├── notifications/
└── audit/
```

## 4. API Principles

- Validate inputs.
- Verify authentication.
- Verify authorization.
- Return predictable response structures.
- Handle errors consistently.
- Never expose secrets.
- Log important failures.

## 5. Server-Side Operations

Good candidates:
- privileged user management
- notification dispatch
- email sending
- audit-sensitive operations
- complex reporting
- scheduled jobs
- third-party integrations

## 6. Email Integration

Use an email provider such as Resend through a server-side function/API layer.

Never expose the email API key in the browser.

## 7. Notifications

Use Firestore for in-app notification records.

Potential future delivery channels:
- email
- push
- WhatsApp through an approved business provider

## 8. External Integrations

Do not add an external API merely because it exists.

Add an integration only when:
- the business needs it
- the provider is reliable
- credentials can be secured
- the cost/limits are understood
- the integration is documented

## 9. API Versioning

If public APIs are later exposed, use versioned endpoints such as:

```text
/api/v1/...
```

Do not prematurely build a public API.

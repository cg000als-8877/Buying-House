# XYZ Buying House — Security Requirements

## 1. Security Priority

This is a commercial B2B platform containing potentially confidential buyer, order, production, pricing, factory, and document information.

Security is a core feature.

## 2. Authentication

Use Firebase Authentication.

Never implement custom password storage.

## 3. Authorization

Use role-based access plus organization-level data isolation.

Example:

```text
Buyer A
→ Buyer Organization A
→ Orders belonging to Organization A only
```

Knowing an order ID must never grant access.

## 4. Firestore Security Rules

Rules must enforce:
- authenticated access
- role permissions
- buyer organization ownership
- document visibility
- write permissions
- admin/staff restrictions

Do not use broad development rules in production.

Never deploy:

```text
allow read, write: if true;
```

## 5. Firebase Storage Rules

Storage rules must enforce:
- authenticated access
- organization ownership
- document visibility
- permitted upload roles
- file path ownership

## 6. App Check

Enable Firebase App Check for supported production resources.

## 7. Secrets

Never commit:
- Firebase Admin credentials
- service account keys
- API secrets
- email API keys
- private tokens

Use environment variables/secrets management.

## 8. Frontend Security

Never trust:
- hidden UI buttons
- route names
- client-side role state
- query parameters
- localStorage values

All sensitive operations require backend/database authorization.

## 9. Input Validation

Validate data using:
- Zod on application inputs
- server-side validation
- Firestore rules where appropriate

## 10. File Security

Validate:
- file type
- size
- authorization
- storage path

Do not allow arbitrary users to upload executable content.

## 11. Audit Logs

Audit important administrative and business changes.

## 12. Privacy

Collect only information required for business operations.

Do not expose internal notes, pricing, private factory information, or other confidential data to buyers unless explicitly authorized.

## 13. Error Messages

Do not expose:
- database internals
- stack traces
- secret values
- authentication details

Production users should receive useful but safe error messages.

## 14. Security Testing

Before production:
- test unauthorized buyer access
- test cross-buyer access
- test disabled accounts
- test document permissions
- test admin restrictions
- test direct URL access
- test manipulated IDs
- test storage rules

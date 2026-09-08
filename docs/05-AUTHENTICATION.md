# XYZ Buying House — Authentication

## 1. Authentication Provider

Use Firebase Authentication.

Initial method:
- Email + password

Future options can be considered:
- Google sign-in for internal staff
- MFA
- SSO for enterprise buyers

Do not add them unless required.

## 2. Authentication Flows

### Buyer
```text
Login
→ Firebase Authentication
→ verify account status
→ load user role
→ load buyer organization
→ Buyer Dashboard
```

### Staff
```text
Login
→ Firebase Authentication
→ verify staff role
→ Admin/Staff Dashboard
```

## 3. Password Reset

Provide:
- Forgot password
- Reset email
- New password
- Confirmation
- Return to login

Never expose whether an arbitrary email exists through error messages.

## 4. Session Handling

Protected pages must verify authentication before displaying protected data.

Do not rely only on client-side route guards.

## 5. Authorization

Authentication answers:
"Who are you?"

Authorization answers:
"What are you allowed to access?"

Both are mandatory.

## 6. Buyer Access

A buyer user's access must be scoped to their `buyerOrganizationId`.

Example:

```text
User → Buyer Organization → Permitted Orders
```

## 7. Staff Access

Staff permissions must be role-based and preferably permission-based for sensitive operations.

## 8. Logout

Logout must:
- invalidate the local session
- redirect to appropriate login page
- prevent access through stale client state

## 9. Account States

Support:

```text
active
invited
suspended
disabled
```

Disabled/suspended users must not access protected resources.

## 10. Security Requirements

- Never store passwords manually.
- Never put secrets in frontend code.
- Use Firebase Security Rules.
- Use App Check where appropriate.
- Validate authorization on server/database operations.
- Rate-limit sensitive backend actions where applicable.
- Log important administrative actions.

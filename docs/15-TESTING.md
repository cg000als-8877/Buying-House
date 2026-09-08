# XYZ Buying House — Testing Strategy

## 1. Testing Levels

Use:
- unit tests
- integration tests
- end-to-end tests
- security tests
- manual UX testing

## 2. Unit Tests

Use Vitest for:
- calculations
- validation
- utility functions
- production percentage calculations
- status logic
- permission helpers

## 3. End-to-End

Use Playwright.

Critical flows:

### Buyer
```text
Login
→ Dashboard
→ Orders
→ Open Order
→ View Production
→ View Document
→ Notifications
→ Logout
```

### Admin
```text
Login
→ Create Buyer
→ Create Order
→ Add Production Update
→ Publish
→ Verify Buyer Can See It
```

## 4. Security Tests

Must verify:

```text
Buyer A cannot access Buyer B's order
Buyer A cannot access Buyer B's documents
Buyer A cannot access internal documents
Disabled user cannot access protected data
Staff cannot perform unauthorized admin actions
Direct URL manipulation does not bypass authorization
```

## 5. Production Tests

Test:
- planned quantity
- actual quantity
- zero plan
- negative/invalid values
- cumulative quantity
- delayed stages
- completed stages
- missing updates
- date/time boundaries

## 6. File Tests

Test:
- allowed file
- unsupported file
- oversized file
- unauthorized upload
- unauthorized download
- deleted/archived document
- duplicate/versioned document

## 7. Responsive Testing

Test at:
- mobile
- tablet
- laptop
- desktop
- large desktop

## 8. Accessibility

Test:
- keyboard navigation
- focus
- labels
- contrast
- screen-reader semantics where practical
- reduced motion

## 9. Performance

Monitor:
- Core Web Vitals
- image sizes
- JavaScript bundle size
- animation performance
- Firestore query efficiency

## 10. Release Gate

Do not release when:
- security rules are untested
- buyer isolation is unverified
- production data can be corrupted
- critical flows are broken
- secrets are committed
- production errors are not monitored

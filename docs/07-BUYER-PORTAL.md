# XYZ Buying House — Buyer Portal

## 1. Purpose

The Buyer Portal is the main digital service for existing buyers.

Its primary promise:

> Give buyers a clear, secure, up-to-date view of their orders and production without requiring them to request status manually.

## 2. Dashboard

Show:

- Active orders
- Orders in production
- Pending approvals
- Upcoming milestones
- Recent production updates
- Recent notifications
- Shipment updates where available

## 3. Orders

Order list should support:

- search
- status filter
- date filter
- product/category filter
- sorting
- pagination

Columns/cards may include:

- Order number
- Style
- Product
- Quantity
- Factory if buyer-visible
- Delivery date
- Current status
- Progress

## 4. Order Detail

Show:

```text
Order information
Product/style
Quantity
Important dates
Factory information if permitted
Overall progress
Production timeline
Latest update
Documents
Samples
Quality
Shipment
```

## 5. Production

The buyer should see:

- current stage
- stage progress
- daily production
- planned vs actual
- cumulative progress
- remarks
- production photos
- latest update date

Example:

```text
CUTTING
Plan: 5,000
Actual: 5,200

SEWING
Plan: 4,500
Actual: 4,300
```

## 6. Production Timeline

Example:

```text
Order Confirmed       ✓
Materials             ✓
Cutting               ✓
Sewing                ●
Finishing             ○
QC                    ○
Packing               ○
Shipment              ○
```

Statuses must be data-driven, not hard-coded.

## 7. Samples

Show:
- sample type
- status
- submitted date
- revision
- comments
- images/documents

If approval is enabled:

```text
Approve
Request Revision
```

Approval actions must be logged.

## 8. Documents

Buyers can see only documents explicitly authorized for their organization.

Provide:
- name
- document type
- date
- file type
- download/view action

## 9. Quality

Where enabled:
- inspection type
- date
- result
- remarks
- report

## 10. Shipment

Where enabled:
- shipment status
- booking
- carrier/forwarder
- departure
- arrival
- tracking/reference

## 11. Notifications

Notify buyers about:
- production updates
- document uploads
- approval requests
- important status changes
- shipment updates
- messages

## 12. Mobile UX

The buyer portal must work well on phones because buyers may check production while traveling.

Prioritize:
- quick dashboard
- order search
- latest production update
- document access
- notifications

## 13. Empty/Error States

Every major area must have:
- loading state
- empty state
- error state
- retry option where appropriate

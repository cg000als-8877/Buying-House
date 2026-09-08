# XYZ Buying House — Site Architecture

## 1. Application Structure

The application has three major areas:

- Public Website
- Buyer Portal
- Admin/Staff Portal

## 2. Public Routes

```text
/
├── /about
├── /services
├── /products
├── /capabilities
├── /quality
├── /compliance
├── /sustainability
├── /factories
├── /insights
├── /contact
└── /buyer/login
```

Optional future pages:

```text
/case-studies
/certifications
/careers
```

## 3. Buyer Routes

```text
/buyer/login
/buyer/forgot-password
/buyer/dashboard
/buyer/orders
/buyer/orders/[orderId]
/buyer/orders/[orderId]/production
/buyer/orders/[orderId]/samples
/buyer/orders/[orderId]/documents
/buyer/orders/[orderId]/quality
/buyer/orders/[orderId]/shipment
/buyer/notifications
/buyer/profile
```

## 4. Admin Routes

```text
/admin/login
/admin/dashboard
/admin/buyers
/admin/buyers/[buyerId]
/admin/orders
/admin/orders/new
/admin/orders/[orderId]
/admin/orders/[orderId]/production
/admin/orders/[orderId]/samples
/admin/orders/[orderId]/documents
/admin/orders/[orderId]/quality
/admin/orders/[orderId]/shipment
/admin/factories
/admin/factories/[factoryId]
/admin/users
/admin/notifications
/admin/audit-logs
/admin/settings
```

## 5. Navigation

### Public
- Home
- About
- Services
- Products
- Capabilities
- Quality
- Compliance
- Sustainability
- Factories
- Insights
- Contact
- Buyer Login

### Buyer
- Dashboard
- Orders
- Production
- Samples
- Documents
- Quality
- Shipment
- Notifications
- Profile

### Admin
- Dashboard
- Buyers
- Orders
- Production
- Factories
- Samples
- Documents
- Quality
- Shipments
- Users
- Notifications
- Audit Logs
- Settings

## 6. UX Principle

Public pages should be editorial, visual, premium, and conversion-focused.

Buyer/Admin pages should prioritize:
- clarity
- speed
- data density
- usability
- accessibility
- predictable navigation

Do not apply heavy marketing animation to operational dashboards.

## 7. Responsive Strategy

The platform must support:
- desktop
- laptop
- tablet
- mobile

Production tables must have an intentional mobile strategy rather than simply overflowing the viewport.

# XYZ Buying House — Business Requirements

## 1. Business Context

XYZ operates as a Bangladesh buying house/apparel sourcing organization. The platform must support two business objectives:

1. Win new buyers through a credible public presence.
2. Serve existing buyers through transparent digital order monitoring.

## 2. Public Website Requirements

The public website must communicate:

- Company background
- Bangladesh sourcing advantage
- Product categories
- Product development capability
- Sourcing capability
- Factory network
- Production management
- Quality assurance
- Compliance
- Sustainability
- Logistics/shipment capability
- Buyer inquiry/contact options

Only verified company claims may be published.

## 3. Buyer Portal Requirements

Authorized buyers should be able to:

- Log in securely.
- See a dashboard of their permitted orders.
- Open individual orders.
- View order quantities and important dates.
- View production stage/status.
- View daily production data.
- View production progress.
- View production photos when provided.
- View relevant documents.
- View sample status.
- View quality/inspection status when enabled.
- View shipment status when enabled.
- Receive notifications.
- Update their profile.
- Approve/request revision for selected workflow items if enabled.

## 4. Admin Requirements

Authorized XYZ staff should be able to:

- Create and manage buyer organizations.
- Create buyer users.
- Create and manage orders.
- Assign orders to buyers and internal staff.
- Assign factories.
- Define production stages.
- Enter daily production quantities.
- Upload production photos.
- Add remarks/issues.
- Upload documents.
- Manage sample stages and approvals.
- Record inspection/QC information.
- Manage shipment information.
- Send or trigger notifications.
- Review audit history.
- Control user permissions.

## 5. Buyer Data Isolation

This is a mandatory requirement.

A buyer must never be able to access another buyer's:
- Orders
- Production records
- Documents
- Photos
- Messages
- Pricing
- Factory information marked internal
- Other confidential information

Security must be enforced server-side/database-side, not only by hiding UI elements.

## 6. Daily Production Requirement

For each relevant order, XYZ should be able to publish a daily update containing configurable production information such as:

- Date
- Production stage
- Planned quantity
- Actual quantity
- Achievement percentage
- Cumulative quantity
- Remarks
- Issues
- Corrective action
- Photos
- Updated by

The exact fields can vary by production stage.

## 7. Buyer Transparency

The buyer experience should answer:

- What is my order status?
- How much has been produced?
- What happened today?
- What is the next milestone?
- Is anything delayed?
- Are samples awaiting approval?
- Are documents available?
- What is the expected shipment status?

## 8. Inquiry Requirements

Prospective buyers should be able to submit:

- Name
- Company
- Country
- Email
- Phone/WhatsApp
- Product category
- Estimated quantity
- Target delivery date
- Message
- Optional file/tech-pack upload

The final form should only collect data XYZ actually needs.

## 9. Data That Must Be Confirmed With Client

Before production launch, collect actual:
- Product categories
- Production stages
- Factory network
- Certifications
- Quality procedures
- Buyer workflow
- Order fields
- Sample stages
- Shipment workflow
- Document types
- Staff roles
- Notification preferences
- Data retention requirements

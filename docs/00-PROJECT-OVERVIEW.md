# XYZ Buying House — Project Overview

## 1. Project Vision

XYZ is a Bangladesh-based apparel buying house and sourcing partner. The digital platform will combine:

1. A premium public corporate website for attracting and building trust with new international buyers.
2. A secure Buyer Portal where existing buyers can monitor their orders, production progress, documents, samples, quality status, and shipment information.
3. An Admin/Staff Portal where XYZ employees manage buyers, orders, factories, production updates, documents, samples, quality records, and shipments.

The platform should feel like a professional international apparel sourcing company, not a simple company profile website.

## 2. Primary Goals

### Business goals
- Establish credibility with new buyers.
- Clearly communicate XYZ's sourcing, product development, production management, quality, compliance, and logistics capabilities.
- Demonstrate factory and manufacturing capability.
- Make buyer communication more transparent.
- Reduce repetitive manual production-status communication.
- Give existing buyers a secure self-service order portal.
- Create a scalable digital foundation for future order management.

### Product goals
- Fast, responsive, accessible public website.
- Secure authentication.
- Buyer-specific data isolation.
- Daily production visibility.
- Production photos and reports.
- Centralized order documents.
- Admin-controlled data.
- Mobile-friendly buyer portal.
- Clear auditability of important changes.

## 3. Users

- Public visitor / prospective buyer
- Buyer user
- Super Admin
- Admin / Operations Manager
- Merchandiser
- Production Staff
- QC Staff

Final roles and permissions are defined in `06-USER-ROLES.md`.

## 4. Core Product Areas

### Public website
Home, About, Services, Products, Capabilities, Quality, Compliance, Sustainability, Factory Network, Insights, Contact/Inquiry.

### Buyer portal
Login, Dashboard, Orders, Order Details, Production, Samples, Documents, Quality, Shipment, Notifications, Profile.

### Admin portal
Dashboard, Buyers, Orders, Production, Factories, Samples, Documents, Quality, Shipments, Users, Notifications, Settings, Audit Logs.

## 5. Core Order Lifecycle

The system should support a configurable lifecycle such as:

Inquiry → Development → Sampling → Order Confirmation → Material/Fabric → Cutting → Production/Sewing → Finishing → QC → Packing → Shipment → Completed

The exact stages must remain configurable because different orders may follow different processes.

## 6. Technology Direction

Initial target stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- GSAP
- Motion
- Lenis
- Lucide React
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase App Check
- Firebase Cloud Functions where required
- React Hook Form
- Zod
- TanStack Table
- Recharts
- date-fns
- Resend
- Sentry
- Playwright
- Vitest
- GitHub
- Vercel

The implementation must avoid unnecessary duplicate libraries.

## 7. Source of Truth

The `/docs` folder is the project's product and technical specification.

Before implementing a major feature, the coding agent must read the relevant documentation and update the documentation when an architectural decision changes.

## 8. Non-Goals for Initial Release

Do not automatically build:
- Full ERP functionality.
- Accounting.
- Payroll.
- Inventory management unrelated to buyer orders.
- Complex factory MES functionality.
- Native mobile apps.
- AI features unless specifically approved.
- Payment processing unless the client later requires it.

## 9. Business Data Policy

Real client data, buyer names, factory information, certifications, quantities, pricing, and claims must not be invented.

During development use clearly labeled demo data.

## 10. Success Criteria

The project is successful when:

- A new buyer can understand XYZ's capabilities and trust signals.
- A prospective buyer can submit an inquiry.
- An authorized buyer can securely log in.
- A buyer can see only their own permitted data.
- XYZ staff can create/manage an order.
- Staff can publish daily production updates.
- Buyers can see production progress and relevant photos.
- Authorized documents can be uploaded and accessed securely.
- Important actions are auditable.
- The application works well on desktop and mobile.
- The system can be expanded without rewriting the core architecture.

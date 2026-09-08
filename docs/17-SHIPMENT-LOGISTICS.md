# 17 — Shipment & Logistics Management Module Architecture

## 1. Overview & System Purpose

The **Shipment & Logistics Management Module** serves as the critical final operational link in the XYZ Buying House digital supply chain:

$$\text{Order} \longrightarrow \text{Production Floor} \longrightarrow \text{Quality Approval (AQL)} \longrightarrow \text{Packing} \longrightarrow \text{Commercial Title Deeds} \longrightarrow \text{Vessel Dispatch} \longrightarrow \text{In Transit} \longrightarrow \text{Buyer Delivery Confirmation}$$

This module ensures deterministic packing list calculations, strictly enforced pre-shipment quality gates, robust tenant isolation for multi-brand buyers, and tamper-evident append-only audit logging for cargo operations.

---

## 2. Core Domain Data Model

### Transport Modes & Incoterms
- **Transport Modes**: `SEA_FCL` (Full Container Load), `SEA_LCL` (Less than Container Load), `AIR` (Air Cargo), `ROAD` (Cross-Border Trucking), `COURIER` (Express).
- **Incoterms (ICC 2020)**: `FOB` (Free On Board), `CIF` (Cost, Insurance & Freight), `CFR` (Cost and Freight), `EXW` (Ex Works), `DDP` (Delivered Duty Paid), `DAP` (Delivered at Place), `FCA` (Free Carrier).

### Shipment Lifecycle State Machine
```
PLANNING
   │
   ▼
BOOKING_REQUESTED
   │
   ▼
 BOOKED
   │
   ▼
 PACKING
   │
   ▼ (Strict Quality & Production Gate)
READY_TO_SHIP
   │
   ▼
DISPATCHED
   │
   ▼
IN_TRANSIT ──► CUSTOMS_HOLD ──► CUSTOMS_CLEARED
   │
   ▼
ARRIVED_AT_PORT
   │
   ▼
OUT_FOR_DELIVERY
   │
   ▼
DELIVERED (Buyer Confirmed)
```

---

## 3. Deterministic Packing Mathematical Engine

### Single Carton CBM
$$\text{CBM} = \frac{\text{Length (cm)} \times \text{Width (cm)} \times \text{Height (cm)}}{1,000,000}$$

### Total Line Volume
$$\text{Total CBM} = \text{round}\left(\text{Single CBM} \times \text{Total Cartons}, 4\right)$$

### Aggregated Shipment Metrics
- $\text{Total Cartons} = \sum \text{totalCartons}$
- $\text{Total Pieces} = \sum \text{totalPieces}$
- $\text{Total Gross Weight (kg)} = \sum \text{grossWeightKG}$
- $\text{Total Net Weight (kg)} = \sum \text{netWeightKG}$
- $\text{Weight Variance (kg)} = \text{Total Gross Weight} - \text{Total Net Weight}$

---

## 4. Deterministic Pre-Shipment Readiness Gates

Before any shipment can progress to `READY_TO_SHIP` or `DISPATCHED`, the platform evaluates three gates:

1. **Quality Gate (ISO 2859-1 / AQL Standards)**:
   - At least 1 recorded inspection for the purchase order.
   - 0 unresolved critical defects.
   - 0 open Corrective Action Plans (CAPs) pending verification.
   - Inspection result is `PASS`.
2. **Production / Volume Gate**:
   - Total packed garments in the packing list must meet at least 95% of the PO quantity.
3. **Commercial Document Gate**:
   - Mandatory commercial shipping documents (Commercial Invoice, Packing List, Bill of Lading / Air Waybill, Certificate of Origin, Quality Inspection Certificate) must be uploaded and verified.

### Manager Override Protocol
In extraordinary commercial scenarios (e.g. buyer concessions on non-critical shade variations or expedited air-freight pull forwards), authorized managers (`Super Admin`, `Admin`, `Operations Manager`) may apply a structured override with mandatory audit-logged justification.

---

## 5. Security & Tenant Isolation

- **Buyer Portal Boundary**: Queries are strictly filtered by `buyerOrganizationId` derived from session credentials.
- **Redaction of Internal Operations**: Internal staff notes and private factory remarks are redacted before returning data to buyer sessions.
- **Buyer Delivery Confirmation**: Authenticated buyers can confirm physical receipt of goods, recorded quantities, condition notes, and cargo damage claims with cryptographically auditable timestamps and signatory names.
- **Audit Logging**: 13 discrete security events recorded in append-only `auditLogs` collection.

# STEP 15 — ADVANCED REPORTING & MANAGEMENT ANALYTICS

## 1. Executive Summary

The **Advanced Reporting & Analytics Module** provides the management intelligence layer for the XYZ Buying House platform. It synthesizes operational telemetry from across all six core production and commercial domains:

$$\text{Orders} \longrightarrow \text{Production} \longrightarrow \text{Samples} \longrightarrow \text{Documents} \longrightarrow \text{Quality} \longrightarrow \text{Shipments}$$

The reporting engine is built on four core principles:
1. **Zero Fabricated Metrics**: Every metric, average, rate, and distribution is deterministically derived from live domain records.
2. **Strict Tenant Isolation**: All buyer queries and exported reports are mathematically bounded to `user.buyerOrganizationId`.
3. **Sensitive Data Redaction**: Internal factory costing, margins, and inspector internal notes are completely stripped from buyer-accessible endpoints and CSV exports.
4. **Division-by-Zero Protection & Robust Mathematics**: All rate functions gracefully return `0%` or explicit `N/A` indicators when sample sizes are zero.

---

## 2. Analytics Domain Architecture

```
                                  +-----------------------------+
                                  |   Raw Domain Collections    |
                                  |  Orders, Production, QA,    |
                                  |  Samples, Vault, Logistics  |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |  Pure Calculation Engine    |
                                  |   (calculations.ts)         |
                                  |  Pass Rates, Variance, OTD, |
                                  |  Turnaround Days, Pareto    |
                                  +--------------+--------------+
                                                 |
                                  +--------------+--------------+
                                  |                             |
                                  v                             v
                    +---------------------------+ +---------------------------+
                    | Admin Analytics Workspace | | Buyer Sourcing Dashboard  |
                    | (/admin/reports)          | | (/buyer/reports)          |
                    | - 9 Cross-Domain Portals  | | - Tenant-Isolated POs     |
                    | - Factory Scorecards      | | - Quality Pass Rates      |
                    | - Defect Pareto Analysis  | | - On-Time Delivery Rates  |
                    | - Full Unredacted Export  | | - Redacted CSV Export     |
                    +---------------------------+ +---------------------------+
```

---

## 3. Supported Analytics Views

### 3.1 Executive Management Dashboard
* **Total Order Volume & Value**: Aggregated pieces and estimated FOB turnover.
* **First-Time Quality Pass Rate (FTPR)**: AQL inspection success rate.
* **On-Time Dispatch Rate (OTD)**: Punctual vessel departure vs factory ex-factory dates.
* **Sample Approval Cycle**: Mean turnaround time from development dispatch to buyer sign-off.
* **Critical Operations Alerts**: Real-time exception feeds (failed inspections, delayed consignments).

### 3.2 Order Performance Analytics
* Total orders, volume, active vs completed vs cancelled distributions.
* Lead time average duration in days.
* Volume breakdown by product category (Circular Knitwear, Denim, Woven Outerwear, Sweaters).
* Detailed PO performance ledger.

### 3.3 Production Floor Telemetry
* Planned vs produced quantities.
* Stage-wise completion (Cutting, Sewing, Finishing).
* Factory line utilization and throughput efficiency.

### 3.4 Quality & AQL Inspection Analytics
* First-Time Pass Rate (FTPR) against AQL 1.5/2.5 standards.
* Defect Pareto breakdown (Critical, Major, Minor).
* Factory compliance and reliability scorecards.
* Corrective Action Plan (CAP) closure rates.

### 3.5 Sample Approval Velocity
* Proto, Fit, Pre-Production (PP), and TOP sample turnarounds.
* First-round approval rate vs revision frequency.
* Buyer decision response latency benchmarks.

### 3.6 Commercial Document Compliance
* Export dossier completion (Bill of Lading, Commercial Invoice, Packing List, Certificate of Origin).
* Document vault velocity and 30-day expiration warnings.

### 3.7 Shipment & Logistics Analytics
* Consignment tracking and in-transit monitoring.
* Freight mode splits (Ocean vs Air vs Road).
* Carrier punctuality and transit delay variance.

### 3.8 Factory Performance Scorecards
* Capacity load vs allocated orders.
* Manufacturing quality pass rates and open defect trends.

---

## 4. RBAC Permissions Matrix

| Permission | Super Admin | Admin | Operations Manager | Merchandiser | Production Staff | QC Staff | Buyer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `reports.read` |  |  |  |  |  |  |  (Tenant) |
| `reports.export` |  |  |  |  | ❌ | ❌ |  (Redacted) |
| `reports.advanced` |  |  |  | ❌ | ❌ | ❌ | ❌ |
| `reports.configure` |  |  | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Security & Audit Logging

Every report generation and CSV export creates an immutable security audit trail:
* `REPORT_GENERATED`
* `REPORT_EXPORTED`
* `REPORT_SNAPSHOT_CREATED`
* `REPORT_CONFIGURATION_UPDATED`

Buyer CSV exports are processed through an RFC 4180 sanitizer that automatically redacts sensitive commercial keys (`factoryMargin`, `costPrice`, `internalRemarks`, `inspectorPrivateNotes`).

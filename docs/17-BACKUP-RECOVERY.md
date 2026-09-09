# XYZ Buying House — Disaster Recovery & Backup Protocol

## 1. Scope & Objective
This document outlines the operational disaster recovery (DR) protocols, automated backup architecture, recovery point objectives (RPO), and recovery time objectives (RTO) for the XYZ Buying House digital supply chain platform.

---

## 2. Backup Architecture & Target RPO / RTO

| Service / Layer | Backup Mechanism | Target Frequency | RPO | Target RTO | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloud Firestore** | GCP Managed Scheduled Export to Cloud Storage | Daily (02:00 UTC) | 24 Hours | < 2 Hours | `CLIENT CONFIGURATION REQUIRED` |
| **Cloud Storage** | Dual-Region / Multi-Region Bucket Object Versioning | Continuous | Real-time | < 30 Minutes | `CLIENT CONFIGURATION REQUIRED` |
| **Application Code** | Git Version Control with Signed Releases | Per commit / Tagged | Zero data loss | < 15 Minutes | `IMPLEMENTED` |
| **Security Audit Logs** | Immutable Append-Only Firestore Collection + Long-Term GCP Coldline Archive | Daily export | 24 Hours | < 4 Hours | `IMPLEMENTED` |

---

## 3. Automated Firestore Backup Configuration

To enable automated daily backups on Google Cloud Platform:

1. **Create Backup Storage Bucket**:
   ```bash
   gcloud storage buckets create gs://xyz-buying-house-firestore-backups --location=asia-south1
   ```
2. **Configure Cloud Scheduler Job**:
   Create a scheduled cron job triggering Cloud Firestore Export via Cloud Function or Cloud Run endpoint:
   - Schedule: `0 2 * * *` (Daily at 02:00 UTC).
   - Target: `https://firestore.googleapis.com/v1/projects/xyz-buying-house-prod/databases/(default):exportDocuments`
   - Output URI: `gs://xyz-buying-house-firestore-backups/daily`

---

## 4. Recovery & Restore Procedures

### Firestore Data Restoration
In the event of accidental data corruption or logical failure:
1. Identify the target backup snapshot folder in `gs://xyz-buying-house-firestore-backups/daily/YYYY-MM-DD/`.
2. Execute the Firestore import command:
   ```bash
   gcloud firestore import gs://xyz-buying-house-firestore-backups/daily/YYYY-MM-DD/
   ```
3. To restore an individual tenant or collection:
   ```bash
   gcloud firestore import gs://xyz-buying-house-firestore-backups/daily/YYYY-MM-DD/ --collection-ids=orders,documents,samples
   ```

### Storage File Recovery
1. If object versioning is enabled on Cloud Storage:
   ```bash
   gcloud storage objects restore gs://xyz-buying-house-prod.appspot.com/documents/org-id/doc-id/spec.pdf#GENERATION_ID
   ```

---

## 5. Annual Disaster Recovery Drill Checklist
- [ ] Verify daily Firestore backup bucket receives new timestamped directories.
- [ ] Perform a dry-run import into a staging Firestore database instance (`xyz-buying-house-staging`).
- [ ] Confirm integrity of sample records, packing lists, inspection logs, and security audit entries.
- [ ] Document audit restoration time and sign off with Lead Sourcing Administrator.

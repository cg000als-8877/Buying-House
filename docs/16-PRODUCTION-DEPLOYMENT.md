# XYZ Buying House — Production Deployment & Environment Guide

## 1. Environment Topology

The XYZ Buying House platform is architected across three distinct environment tiers:

1. **Local Development (`development`)**:
   - Runs on `http://localhost:3000`.
   - Supports zero-credential offline simulator mode for rapid local iteration.
   - Hot-module reloading and mocked security logging.
2. **Staging / QA (`staging`)**:
   - Hosted on preview domains (e.g. `https://staging.xyzbuyinghouse.com` or Vercel preview branch deployments).
   - Connected to dedicated staging Firebase project (`xyz-buying-house-staging`).
   - Uses simulated email provider (`DEVELOPMENT_SIMULATOR`) or sandbox SMTP.
3. **Production (`production`)**:
   - Hosted on high-availability edge infrastructure (Vercel Enterprise, GCP Cloud Run, or AWS).
   - Connected to isolated production Firebase project (`xyz-buying-house-prod`).
   - Strict Firebase App Check (reCAPTCHA v3 Enterprise / Play Integrity), live email provider (Resend / SendGrid), and external APM error monitoring.

---

## 2. Environment Variables & Secret Separation

### A. Client-Safe Variables (`NEXT_PUBLIC_*`)
These variables are bundled into client JavaScript and must never contain private keys or secrets:

| Variable Name | Classification | Description | Production Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **Required** | Canonical production URL for redirects and absolute links. | `https://portal.xyzbuyinghouse.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | **Required** | Firebase Web API key for client SDK. | `AIzaSy...` (from Firebase Console) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | **Required** | Firebase Authentication domain. | `xyz-buying-house-prod.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | **Required** | Google Cloud / Firebase Project ID. | `xyz-buying-house-prod` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | **Required** | Cloud Storage bucket for document vault & photos. | `xyz-buying-house-prod.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | **Required** | Cloud Messaging sender ID. | `1029384756` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | **Required** | Firebase Web Application ID. | `1:1029384756:web:abcd1234ef` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | **Optional** | Google Analytics 4 Measurement ID. | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY` | **Optional / Prod** | reCAPTCHA v3 site key for Firebase App Check. | `6Lf...` |
| `NEXT_PUBLIC_SENTRY_DSN` | **Optional / Prod** | Sentry client telemetry DSN. | `https://xxx@sentry.io/yyy` |

### B. Server-Only Secrets (Never Exposed to Client)
These variables must only be injected via server hosting environment settings (e.g. Vercel Project Settings, GCP Secret Manager):

| Variable Name | Classification | Description | Secret Handling |
| :--- | :--- | :--- | :--- |
| `FIREBASE_ADMIN_PROJECT_ID` | **Optional / Prod** | Firebase Admin SDK project identifier. | Injected server-side |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | **Optional / Prod** | Service account client email. | Injected server-side |
| `FIREBASE_ADMIN_PRIVATE_KEY` | **Optional / Prod** | Service account RSA private key. | Injected server-side |
| `EMAIL_PROVIDER` | **Required** | Email adapter engine (`DEVELOPMENT_SIMULATOR` or `PRODUCTION`). | `PRODUCTION` |
| `EMAIL_FROM` | **Required** | Default sender email address. | `notifications@xyzbuyinghouse.com` |
| `EMAIL_API_KEY` | **Prod Required** | Resend / SendGrid / Postmark API key for transactional email. | Injected server-side |
| `RESEND_API_KEY` | **Optional** | Alias for Resend API key. | Injected server-side |
| `SENDER_EMAIL` | **Optional** | Verified sending address. | `orders@xyzbuyinghouse.com` |

---

## 3. Deployment Procedure

### Step 1: Firebase Project Setup
1. Create a new Google Cloud / Firebase project: `xyz-buying-house-prod`.
2. Enable **Authentication**:
   - Enable **Email/Password** provider.
   - Add authorized domains: `localhost`, `xyzbuyinghouse.com`, `portal.xyzbuyinghouse.com`.
3. Enable **Cloud Firestore**:
   - Create database in production region (`asia-south1` or target geography).
   - Deploy security rules: `firebase deploy --only firestore:rules`
   - Deploy composite indexes: `firebase deploy --only firestore:indexes`
4. Enable **Cloud Storage**:
   - Create bucket with location matching Firestore.
   - Deploy storage security rules: `firebase deploy --only storage:rules`

### Step 2: Build & Verify Hosting
1. Link repository to hosting provider (e.g. Vercel).
2. Configure environment variables in dashboard.
3. Trigger production build:
   ```bash
   npm run build
   ```
4. Verify health endpoint: `GET https://portal.xyzbuyinghouse.com/api/health`.

### Step 3: Domain & DNS Configuration
1. Configure `A` / `CNAME` records pointing to hosting provider edge IPs.
2. Verify automated SSL certificate issuance (Let's Encrypt / Vercel Edge SSL).
3. Ensure HSTS and security headers are active.

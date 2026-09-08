# XYZ Buying House — Deployment & DevOps

## 1. Repository

Use a private GitHub repository.

Recommended branch model:

```text
main
develop
feature/*
fix/*
```

Do not develop directly on production `main` without review.

## 2. Local Environment

Required:
- Node.js LTS
- npm
- Git
- code editor/AI coding environment

## 3. Environment Variables

Use:

```text
.env.local
```

Never commit it.

Example categories:

```text
Firebase public configuration
Firebase server credentials
Email provider key
Monitoring DSN
Analytics IDs
```

Public Firebase web configuration is not equivalent to a secret, but security rules still must protect the backend.

## 4. GitHub

Workflow:

```text
Code
→ test
→ lint
→ commit
→ push
→ pull request
→ review
→ merge
→ deploy
```

## 5. Vercel

Connect the GitHub repository to Vercel.

Use separate environments where appropriate:
- Preview
- Production

Preview deployments should not accidentally use production destructive credentials/data.

## 6. Firebase

Configure:
- Authentication
- Firestore
- Storage
- Security Rules
- App Check
- Cloud Functions if required

## 7. Firebase Project Strategy

Prefer separate projects for:

```text
development
production
```

This prevents testing from damaging live client data.

## 8. Domain

Production should use the client's official domain.

Potential structure:

```text
www.example.com
example.com/buyer
example.com/admin
```

A separate subdomain can be considered later.

## 9. Backups

Define a backup/export strategy for production Firestore data.

Do not assume the free tier alone is a complete disaster-recovery strategy.

## 10. Monitoring

Use Sentry or an equivalent monitoring service for:
- frontend errors
- server errors
- failed workflows
- release tracking

## 11. Analytics

Use privacy-conscious analytics appropriate for the business.

Potential:
- Google Analytics
- Vercel Analytics

## 12. Deployment Checklist

Before production:

```text
[ ] Production Firebase project created
[ ] Firestore rules deployed
[ ] Storage rules deployed
[ ] App Check configured
[ ] Authentication configured
[ ] Environment variables configured
[ ] Domain configured
[ ] HTTPS verified
[ ] Error monitoring enabled
[ ] Email sending tested
[ ] Buyer isolation tested
[ ] Admin permissions tested
[ ] Backup/export strategy confirmed
[ ] Demo data removed
[ ] Real company data reviewed
```

## 13. Cost Policy

Development may use free tiers where appropriate.

Do not promise the client that commercial production infrastructure will remain permanently free. Review provider terms, quotas, and commercial-use restrictions before launch.

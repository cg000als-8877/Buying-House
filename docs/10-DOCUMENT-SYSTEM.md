# XYZ Buying House — Document System

## 1. Purpose

Centralize order-related files while keeping confidential information secure.

## 2. Example Document Types

```text
Tech Pack
Purchase Order
Order Confirmation
Fabric Approval
Lab Dip
Color Approval
Size Set
PP Sample
Inspection Report
Packing List
Commercial Invoice
Shipment Documents
Certificate
Other
```

The final list must be confirmed with XYZ.

## 3. Storage

Use Firebase Storage for binary files.

Firestore stores metadata.

Do not store large files directly inside Firestore.

## 4. Document Metadata

```text
documentId
orderId
buyerOrganizationId
name
type
storagePath
mimeType
fileSize
visibility
uploadedBy
createdAt
updatedAt
```

## 5. Visibility

Suggested values:

```text
buyer
internal
restricted
```

Authorization must be checked before download/view.

## 6. Upload Validation

Validate:
- allowed MIME type
- extension
- file size
- filename
- upload permission

Do not trust the browser-provided MIME type alone for sensitive workflows.

## 7. Versioning

For important documents, prefer versioning over silent replacement.

Example:

```text
PP Sample Report v1
PP Sample Report v2
```

## 8. Download/View

Use secure access mechanisms rather than permanently public URLs for confidential files.

## 9. Retention

The client must define:
- how long documents are retained
- when records are archived
- whether deletion is allowed
- who can permanently delete

## 10. Audit

Log important document actions:
- upload
- replacement
- archive/delete
- permission/visibility changes

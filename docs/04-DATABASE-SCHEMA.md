# XYZ Buying House — Firebase Database Schema

## 1. Database

Use Cloud Firestore.

Collections should be designed around clear ownership, security boundaries, and query patterns.

## 2. Core Collections

```text
users
buyerOrganizations
factories
orders
orderItems
productionStages
productionUpdates
productionPhotos
samples
sampleComments
documents
inspections
shipments
notifications
inquiries
messages
certifications
auditLogs
settings
```

## 3. users

Suggested fields:

```text
uid
email
displayName
role
buyerOrganizationId
status
photoURL
createdAt
updatedAt
lastLoginAt
```

## 4. buyerOrganizations

```text
name
country
website
contactEmail
contactPhone
status
notes
createdAt
updatedAt
```

## 5. factories

```text
name
location
specializations
capacity
employeeCount
certificationIds
contactInformation
status
internalNotes
createdAt
updatedAt
```

## 6. orders

```text
orderNumber
buyerOrganizationId
styleNumber
productName
category
factoryId
quantity
currency
unitPrice            # access controlled
orderDate
exFactoryDate
shipmentDate
currentStatus
priority
assignedMerchandiserId
createdAt
updatedAt
```

## 7. productionUpdates

```text
orderId
date
stageId
plannedQuantity
actualQuantity
cumulativeQuantity
achievementPercentage
status
remarks
issues
correctiveAction
updatedBy
publishedAt
createdAt
updatedAt
```

## 8. productionPhotos

```text
orderId
productionUpdateId
storagePath
thumbnailPath
caption
date
uploadedBy
createdAt
```

## 9. samples

```text
orderId
sampleType
status
submittedAt
approvedAt
rejectedAt
revisionNumber
remarks
createdAt
updatedAt
```

## 10. documents

```text
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

Visibility should distinguish buyer-visible and internal documents.

## 11. inspections

```text
orderId
inspectionType
inspectionDate
status
result
remarks
reportDocumentId
inspector
createdAt
updatedAt
```

## 12. shipments

```text
orderId
status
forwarder
carrier
bookingReference
containerReference
estimatedDeparture
estimatedArrival
actualDeparture
actualArrival
trackingReference
createdAt
updatedAt
```

## 13. notifications

```text
recipientUserId
type
title
message
relatedOrderId
read
createdAt
```

## 14. inquiries

```text
name
company
country
email
phone
productCategory
estimatedQuantity
targetDeliveryDate
message
attachmentPath
status
assignedTo
createdAt
updatedAt
```

## 15. auditLogs

```text
actorUid
action
entityType
entityId
before
after
timestamp
ipMetadataIfApproved
```

Do not store unnecessary sensitive information.

## 16. Data Design Rules

- Every buyer-owned record must contain a buyer organization reference.
- Never depend on client-side filtering for authorization.
- Use timestamps consistently.
- Use IDs rather than duplicated names for relationships.
- Avoid deeply nested structures that make reporting difficult.
- Avoid storing large binary files inside Firestore; use Firebase Storage.
- Add indexes only when required by real queries.

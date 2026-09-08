# XYZ Buying House — User Roles & Permissions

## 1. Roles

### Super Admin
Full platform control.

Can:
- manage all users
- manage buyers
- manage orders
- manage factories
- manage production
- manage documents
- manage samples
- manage quality
- manage shipments
- manage settings
- review audit logs

### Admin / Operations Manager
Operational management.

Can:
- manage buyers
- manage orders
- manage factories
- manage production
- manage documents
- manage samples
- manage quality
- manage shipments

Should not modify critical security/system settings unless explicitly permitted.

### Merchandiser
Can:
- view assigned buyers/orders
- update assigned orders
- manage production follow-up
- upload relevant documents
- update sample workflow
- communicate operational remarks

### Production Staff
Can:
- view assigned production orders
- enter production updates
- upload production photos
- add production remarks/issues

Should not access unrelated buyer financial information.

### QC Staff
Can:
- view assigned orders
- enter inspection/QC information
- upload reports
- update inspection status

### Buyer
Can:
- access only their organization's permitted data
- view orders
- view production
- view documents marked buyer-visible
- view samples
- approve/request revision where enabled
- view quality information where enabled
- view shipment information where enabled
- receive notifications
- manage permitted profile information

## 2. Permission Model

Use permissions such as:

```text
buyers.read
buyers.write

orders.read
orders.write

production.read
production.write
production.publish

documents.read
documents.write
documents.delete

samples.read
samples.write
samples.approve

quality.read
quality.write

shipments.read
shipments.write

users.read
users.write

settings.read
settings.write

auditLogs.read
```

## 3. Principle of Least Privilege

Every user receives only the minimum access needed.

## 4. Buyer Boundary

The buyer organization's ID must be part of authorization decisions.

Never authorize a buyer simply because they know an order ID.

## 5. Audit Requirement

Actions such as:
- deleting data
- changing permissions
- changing order quantity
- changing important dates
- publishing production
- approving samples
- uploading/replacing critical documents

should be auditable.

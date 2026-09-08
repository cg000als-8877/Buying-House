# XYZ Buying House — Admin Portal

## 1. Purpose

The Admin Portal is the operational control center for XYZ.

## 2. Dashboard

Show operational KPIs such as:

- active buyers
- active orders
- orders in production
- pending approvals
- delayed orders
- upcoming shipments
- recent updates

Only show metrics that can be calculated reliably from stored data.

## 3. Buyer Management

Admin can:
- create buyer organization
- edit buyer organization
- create buyer users
- suspend/disable users
- assign orders
- view buyer order history

## 4. Order Management

Admin can:
- create order
- edit order
- assign buyer
- assign factory
- assign merchandiser
- define dates
- define quantity
- define production stages
- change status

Sensitive fields must use permission checks.

## 5. Production Management

Admin/staff can:
- select order
- select date
- select production stage
- enter planned quantity
- enter actual quantity
- add cumulative quantity
- add remarks/issues
- upload photos
- publish update

## 6. Document Management

Admin can:
- upload
- categorize
- replace
- archive
- control visibility

Documents should have explicit visibility rules.

## 7. Sample Management

Admin can:
- create sample stage
- upload sample images/documents
- update status
- record buyer comments
- record approval/revision
- track revision count

## 8. Quality Management

Admin/QC can:
- create inspection
- record result
- upload report
- add remarks
- update status

## 9. Shipment Management

Admin can:
- create shipment record
- update shipment status
- add references
- update expected dates
- upload shipment documents

## 10. User Management

Admin should see:
- user
- role
- organization
- status
- last login
- created date

## 11. Audit Logs

Display:
- actor
- action
- entity
- timestamp
- relevant change summary

Do not expose sensitive internal audit information to buyers.

## 12. Admin UX

Admin screens should optimize:
- fast data entry
- filters
- keyboard usability
- bulk-friendly workflows
- clear validation
- safe destructive actions

## 13. Destructive Actions

Deletion should require:
- confirmation
- clear warning
- permission
- audit record

Prefer archive/deactivate over permanent deletion for business records.

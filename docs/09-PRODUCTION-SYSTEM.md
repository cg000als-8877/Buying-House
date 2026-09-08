# XYZ Buying House — Production System

## 1. Purpose

The production system provides buyers with transparent progress while giving XYZ staff a structured method for daily reporting.

## 2. Production Stages

Initial configurable examples:

```text
Fabric / Material
Cutting
Printing / Embroidery
Sewing
Washing
Finishing
QC
Packing
Shipment
```

Not every order must use every stage.

## 3. Stage Configuration

Each order should be able to have an ordered list of applicable stages.

Each stage has:

```text
stageId
name
sequence
status
plannedQuantity
completedQuantity
targetDate
actualCompletionDate
```

## 4. Daily Update

A daily update can contain:

```text
date
stage
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
```

## 5. Production Calculation

Example:

```text
Achievement % = Actual Quantity / Planned Quantity × 100
```

Guard against division by zero.

Overall order progress should be calculated using a documented rule, not arbitrary visual estimation.

## 6. Buyer Visibility

Only published updates should appear to buyers.

Internal drafts may be visible only to authorized staff.

## 7. Production Photos

Each update may contain multiple photos.

Store:
- original file
- optimized/thumbnail version if implemented
- caption
- upload date
- uploader
- related order/update

Photos must use secure storage access.

## 8. Delays

If production is behind plan, staff should be able to record:

- affected stage
- expected delay
- reason
- corrective action
- updated expected date

A delayed order should be visually clear.

## 9. Data Corrections

Production records should not silently change.

If a published update must be corrected:
- preserve audit information
- record who changed it
- record when
- optionally preserve previous values

## 10. Buyer Experience

The most important buyer screen should quickly answer:

```text
What is happening today?
How much was produced?
What is the current stage?
Are we on schedule?
What happens next?
```

## 11. Future Enhancements

Possible later additions:
- production charts
- line-level production
- factory capacity planning
- T&A comparison
- automated delay alerts
- Excel import
- daily report PDF

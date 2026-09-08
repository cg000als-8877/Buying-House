export interface EmailTemplateContext {
  recipientName: string;
  isBuyer: boolean;
  orderNumber?: string;
  styleNumber?: string;
  sampleType?: string;
  inspectionType?: string;
  shipmentNumber?: string;
  documentName?: string;
  delayReason?: string;
  actionUrl?: string;
  customDetails?: Record<string, string | number | boolean>;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const EMAIL_HEADER = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>XYZ Buying House Notification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden; }
    .header { background-color: #0b0f19; padding: 24px; border-bottom: 1px solid #334155; text-align: left; }
    .brand { color: #f59e0b; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
    .body-text { color: #cbd5e1; font-size: 14px; margin-bottom: 24px; }
    .card-box { background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .key-val { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
    .key-val:last-child { margin-bottom: 0; }
    .key { color: #94a3b8; }
    .val { color: #f1f5f9; font-weight: 600; font-family: monospace; }
    .btn { display: inline-block; background-color: #f59e0b; color: #0f172a; font-weight: 700; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
    .footer { padding: 20px 24px; background-color: #0b0f19; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand">XYZ Buying House</h1>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Supply Chain Telemetry &amp; Operations</div>
    </div>
    <div class="content">
`;

const EMAIL_FOOTER = `
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">This is an automated operational notification from XYZ Buying House platform.</p>
      <p style="margin: 0;">Dhaka, Bangladesh &bull; Certified Export Operations &bull; Strict Tenant Confidentiality</p>
    </div>
  </div>
</body>
</html>
`;

export function renderEmailTemplate(templateKey: string, ctx: EmailTemplateContext): RenderedEmail {
  switch (templateKey) {
    case 'order-update': {
      const subject = `[Order Update] ${ctx.orderNumber || 'PO'}: Milestone Status Progression`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title">Purchase Order Status Update</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">Your order <strong>${ctx.orderNumber}</strong> has progressed in the manufacturing lifecycle.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Order Reference:</span><span class="val">${ctx.orderNumber}</span></div>
          ${ctx.styleNumber ? `<div class="key-val"><span class="key">Style:</span><span class="val">${ctx.styleNumber}</span></div>` : ''}
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">View Order Workspace</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Dear ${ctx.recipientName},\nYour order ${ctx.orderNumber} has a new milestone update.\nView: ${ctx.actionUrl || 'https://xyzbuyinghouse.com'}`,
      };
    }

    case 'sample-approval-request': {
      const subject = `[Action Required] Sample Approval Requested for PO ${ctx.orderNumber || ''}`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title">Sample Approval Submission</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">A new <strong>${ctx.sampleType || 'Garment'} Sample</strong> has been dispatched for buyer review and technical evaluation.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Order Reference:</span><span class="val">${ctx.orderNumber || 'N/A'}</span></div>
          <div class="key-val"><span class="key">Sample Stage:</span><span class="val">${ctx.sampleType || 'Pre-Production (PP)'}</span></div>
          ${ctx.styleNumber ? `<div class="key-val"><span class="key">Style #:</span><span class="val">${ctx.styleNumber}</span></div>` : ''}
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">Review &amp; Approve Sample</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Dear ${ctx.recipientName},\nA new ${ctx.sampleType} sample is awaiting your approval for order ${ctx.orderNumber}.\nReview: ${ctx.actionUrl || ''}`,
      };
    }

    case 'sample-decision': {
      const subject = `[Sample Decision] Buyer Feedback Logged for PO ${ctx.orderNumber || ''}`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title">Sample Evaluation Logged</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">A formal review decision has been recorded for the sample submission under <strong>${ctx.orderNumber}</strong>.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Order:</span><span class="val">${ctx.orderNumber || 'N/A'}</span></div>
          <div class="key-val"><span class="key">Sample Type:</span><span class="val">${ctx.sampleType || 'Sample'}</span></div>
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">View Sample Feedback</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Sample evaluation decision recorded for PO ${ctx.orderNumber}.\nView: ${ctx.actionUrl || ''}`,
      };
    }

    case 'production-delay': {
      const subject = `[Production Alert] Schedule Variance Flagged on PO ${ctx.orderNumber || ''}`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title" style="color: #f87171;">Manufacturing Schedule Notice</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">Daily telemetry tracking has detected a potential throughput bottleneck or variance on order <strong>${ctx.orderNumber}</strong>.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Order:</span><span class="val">${ctx.orderNumber}</span></div>
          ${ctx.delayReason ? `<div class="key-val"><span class="key">Identified Bottleneck:</span><span class="val" style="color: #fca5a5;">${ctx.delayReason}</span></div>` : ''}
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">Open Floor Tracking</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Production schedule variance on order ${ctx.orderNumber}. Reason: ${ctx.delayReason || 'Line balancing'}.\nView: ${ctx.actionUrl || ''}`,
      };
    }

    case 'quality-failure': {
      const subject = `[Quality Audit] Non-Conformance Flagged on Inspection (${ctx.orderNumber || ''})`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title" style="color: #f87171;">AQL Quality Inspection Alert</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">An AQL statistical quality audit has identified defects exceeding acceptance criteria on order <strong>${ctx.orderNumber}</strong>. Corrective actions have been initiated.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Order:</span><span class="val">${ctx.orderNumber}</span></div>
          <div class="key-val"><span class="key">Inspection Type:</span><span class="val">${ctx.inspectionType || 'Inline'}</span></div>
          <div class="key-val"><span class="key">Result:</span><span class="val" style="color: #f87171;">NON-CONFORMANT</span></div>
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">Inspect QA Report &amp; CAP</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Quality non-conformance flagged for ${ctx.orderNumber} (${ctx.inspectionType}). CAP initiated.\nView: ${ctx.actionUrl || ''}`,
      };
    }

    case 'cap-overdue': {
      const subject = `[URGENT] Corrective Action Plan (CAP) Overdue for PO ${ctx.orderNumber || ''}`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title" style="color: #ef4444;">Overdue Corrective Action Notice</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">A Corrective Action Plan associated with order <strong>${ctx.orderNumber}</strong> has exceeded its target resolution deadline.</p>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">Review CAP Remediation</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `CAP resolution is overdue for order ${ctx.orderNumber}.\nAction URL: ${ctx.actionUrl || ''}`,
      };
    }

    case 'document-review': {
      const subject = `[Document Vault] Document Requires Review: ${ctx.documentName || 'Commercial Document'}`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title">Commercial Document Verification</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">A new certified document <strong>${ctx.documentName}</strong> has been uploaded and requires review.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Document:</span><span class="val">${ctx.documentName || 'Document'}</span></div>
          ${ctx.orderNumber ? `<div class="key-val"><span class="key">Associated Order:</span><span class="val">${ctx.orderNumber}</span></div>` : ''}
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">View Document Vault</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Commercial document ${ctx.documentName} requires review.\nView: ${ctx.actionUrl || ''}`,
      };
    }

    case 'shipment-booked': {
      const subject = `[Logistics] Freight Booking Confirmed (${ctx.shipmentNumber || 'Consignment'})`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title">Freight Booking Confirmed</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">Cargo booking has been secured with the designated carrier for consignment <strong>${ctx.shipmentNumber}</strong>.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Shipment #:</span><span class="val">${ctx.shipmentNumber}</span></div>
          ${ctx.orderNumber ? `<div class="key-val"><span class="key">PO Reference:</span><span class="val">${ctx.orderNumber}</span></div>` : ''}
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">Track Consignment</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Freight booking confirmed for shipment ${ctx.shipmentNumber}.\nTrack: ${ctx.actionUrl || ''}`,
      };
    }

    case 'shipment-delayed': {
      const subject = `[Logistics Notice] Transit Schedule Revision for ${ctx.shipmentNumber || 'Shipment'}`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title" style="color: #fbbf24;">Transit Schedule Advisory</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">A transit milestone delay or revised estimated arrival has been recorded for consignment <strong>${ctx.shipmentNumber}</strong>.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Shipment #:</span><span class="val">${ctx.shipmentNumber}</span></div>
          ${ctx.delayReason ? `<div class="key-val"><span class="key">Advisory Note:</span><span class="val">${ctx.delayReason}</span></div>` : ''}
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">View Live Tracking</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Transit schedule revision for shipment ${ctx.shipmentNumber}. Note: ${ctx.delayReason || 'Carrier schedule revision'}.\nView: ${ctx.actionUrl || ''}`,
      };
    }

    case 'shipment-dispatched': {
      const subject = `[Logistics] Cargo Dispatched: Consignment ${ctx.shipmentNumber || ''}`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title">Cargo Dispatched &amp; In Transit</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">Consignment <strong>${ctx.shipmentNumber}</strong> has been dispatched from origin port and is officially in transit.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Shipment #:</span><span class="val">${ctx.shipmentNumber}</span></div>
          ${ctx.orderNumber ? `<div class="key-val"><span class="key">PO Reference:</span><span class="val">${ctx.orderNumber}</span></div>` : ''}
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">View Live Milestone Tracker</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Consignment ${ctx.shipmentNumber} has been dispatched from port.\nTrack: ${ctx.actionUrl || ''}`,
      };
    }

    case 'shipment-delivered': {
      const subject = `[Delivery Notice] Cargo Arrived at Destination for ${ctx.shipmentNumber || ''}`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title" style="color: #34d399;">Cargo Delivered / Ready for Receipt</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">Consignment <strong>${ctx.shipmentNumber}</strong> has arrived at destination. Please confirm delivery receipt in your portal once unloaded.</p>
        <div class="card-box">
          <div class="key-val"><span class="key">Shipment #:</span><span class="val">${ctx.shipmentNumber}</span></div>
        </div>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">Confirm Receipt in Portal</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Consignment ${ctx.shipmentNumber} has arrived at destination.\nConfirm receipt: ${ctx.actionUrl || ''}`,
      };
    }

    default: {
      const subject = `[Notification] XYZ Buying House Operations Notice`;
      const html = `
        ${EMAIL_HEADER}
        <h2 class="title">Operational Notification</h2>
        <p class="body-text">Dear ${ctx.recipientName},</p>
        <p class="body-text">You have received a new operational notification on the XYZ Buying House platform.</p>
        ${ctx.actionUrl ? `<p><a href="${ctx.actionUrl}" class="btn">View Notification</a></p>` : ''}
        ${EMAIL_FOOTER}
      `;
      return {
        subject,
        html,
        text: `Dear ${ctx.recipientName},\nYou have a new operational notice.\nView: ${ctx.actionUrl || ''}`,
      };
    }
  }
}

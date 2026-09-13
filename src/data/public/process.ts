/**
 * Buying House Critical Path & Manufacturing Workflow.
 *
 * CONTENT INTEGRITY RULE:
 * Describes the standard milestone-driven operational framework from tech pack to export.
 * Specific stage turnaround times vary depending on season, fabric origin, and order scale.
 *
 * // CLIENT INPUT REQUIRED: Typical T&A calendar milestones and sampling turnaround targets.
 */

export interface WorkflowStage {
  step: number;
  name: string;
  title: string;
  description: string;
  timelineEstimate: string;
  keyOutputs: string[];
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    step: 1,
    name: 'Inquiry & Tech Pack',
    title: 'Inquiry Review & Technical Analysis',
    description: 'Our technical merchandisers analyze buyer design sketches, tech packs, measurement charts, and fabric requirements to establish feasibility.',
    timelineEstimate: '1-2 Days',
    keyOutputs: ['Bill of Materials (BOM) Breakdown', 'Fabric Sourcing Feasibility', 'Preliminary Pricing Matrix'],
  },
  {
    step: 2,
    name: 'Costing & Sourcing',
    title: 'Open Costing & Factory Allocation',
    description: 'We generate an itemized FOB cost sheet and reserve manufacturing lines in compliant partner factories matching the product specialization.',
    timelineEstimate: '2-4 Days',
    keyOutputs: ['Itemized FOB Cost Sheet', 'Factory Allocation Dossier', 'Target Ex-Factory Date'],
  },
  {
    step: 3,
    name: 'Sampling & Approval',
    title: 'Proto, Fit & Pre-Production Sampling',
    description: 'Developing Proto samples, graded fit samples, lab dips for color matching, and size sets for formal buyer sign-off before bulk fabric cutting.',
    timelineEstimate: '7-14 Days',
    keyOutputs: ['Approved Proto & Fit Samples', 'Lab Dip & Strike-Off Approvals', 'Graded Measurement Spec Sheet'],
  },
  {
    step: 4,
    name: 'Order Confirmation',
    title: 'Purchase Order & Raw Material In-House',
    description: 'Purchase Order finalization, bulk yarn and fabric procurement, lab testing for shrinkage and color fastness, and critical path scheduling.',
    timelineEstimate: '10-20 Days',
    keyOutputs: ['Confirmed Master Production Schedule', 'Fabric Inspection Reports (4-Point)', 'Pre-Production (PP) Meeting Sign-Off'],
  },
  {
    step: 5,
    name: 'Bulk Production',
    title: 'Sewing, Washing & Line Monitoring',
    description: 'Bulk cutting, sewing line loading, daily output recording, inline quality checks (DPI), and wet/dry processing under continuous on-site supervision.',
    timelineEstimate: '25-40 Days',
    keyOutputs: ['Live Buyer Portal Telemetry Updates', 'Daily Sewing & Finishing Logs', 'Inline Inspection Reports (DPI)'],
  },
  {
    step: 6,
    name: 'Final Inspection',
    title: 'AQL 1.5 / 2.5 Quality Audit',
    description: 'Pre-final (DUPRO) and Final Random Inspection (FRI) conducted by our certified QC team before packing and container loading permission.',
    timelineEstimate: '2-3 Days',
    keyOutputs: ['Formal AQL Final Inspection Certificate', 'Carton Drop & Barcode Verification', 'Factory Release Authorization'],
  },
  {
    step: 7,
    name: 'Export & Shipment',
    title: 'Customs Clearance & Vessel Dispatch',
    description: 'Container stuffing surveillance, customs dispatch via Chittagong seaport or Dhaka airport, and digital shipping document package handover.',
    timelineEstimate: '3-5 Days',
    keyOutputs: ['Bill of Lading / FCR Document', 'Commercial Invoice & Packing List', 'Post-Shipment Vessel Tracking'],
  },
];

/**
 * Sourcing & Buying House Services Data.
 *
 * CONTENT INTEGRITY RULE:
 * Outlines core service modules and standard commercial deliverables.
 *
 * // CLIENT INPUT REQUIRED: Exact service offerings, specialized testing laboratory deliverables, and shipping forwarder partnerships.
 */

export interface SourcingService {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  capabilities: string[];
  deliverables: string[];
}

export const SERVICES_DATA: SourcingService[] = [
  {
    id: 'sourcing',
    title: 'Vendor Sourcing & Cost Optimization',
    shortDescription: 'Matching international buyer collections with verified, audited Bangladesh garment manufacturers based on machinery, capacity, and target price points.',
    fullDescription: 'We connect global apparel brands to audited, high-efficiency manufacturing facilities in Bangladesh. Our team conducts open-cost sheet analysis, yarn and fabric market monitoring, and capacity reservation to ensure competitive FOB prices and reliable production space.',
    iconName: 'Building2',
    capabilities: [
      'Factory matching based on line capability and order volume',
      'Transparent open-costing and fabric consumption analysis',
      'Yarn and trim market price benchmark tracking',
      'Capacity reservation with scheduled ex-factory timelines',
    ],
    deliverables: [
      'Detailed FOB Price Breakdown',
      'Factory Compliance Dossier',
      'Production Capacity Agreement',
    ],
  },
  {
    id: 'development',
    title: 'Product Development & Sampling',
    shortDescription: 'Precision tech pack interpretation, rapid prototype sampling, fabric R&D, and fit revisions executed prior to bulk order commitment.',
    fullDescription: 'From initial design sketch and tech pack to Proto, Fit, Size Set, and Pre-Production (PP) samples. Our in-house technical merchandising team ensures accurate pattern engineering, shrinkage control, and wash effect replication.',
    iconName: 'Scissors',
    capabilities: [
      'Proto sample turnaround with local and imported fabrics',
      'Fit approval and graded measurement verification',
      'Custom fabric development (GSM, weave, knit structure, bio-wash)',
      'Graphic, embroidery, and trim customization',
    ],
    deliverables: [
      'Proto, Fit, and PP Sample Submissions',
      'Graded Measurement Specification Sheets',
      'Lab Dip & Strike-Off Approvals',
    ],
  },
  {
    id: 'production',
    title: 'Production Line Follow-up & Telemetry',
    shortDescription: 'Daily factory line monitoring, critical path follow-up, and real-time order progression updates accessible through our secure Buyer Portal.',
    fullDescription: 'Our on-site production controllers follow each order across every stage: knitting/weaving, dyeing, cutting, sewing, washing, finishing, and packing. Milestone achievements and line bottleneck mitigations are logged directly into our buyer telemetry database.',
    iconName: 'Activity',
    capabilities: [
      'Daily sewing line input/output verification',
      'Critical Path Management (Time & Action Calendar)',
      'Raw material in-house tracking and lab test verification',
      'Immediate bottleneck resolution and capacity reallocation',
    ],
    deliverables: [
      'Live Production Progress Dashboard (Buyer Portal)',
      'Daily Line Output Logs',
      'Time & Action (T&A) Milestone Tracking',
    ],
  },
  {
    id: 'quality',
    title: 'Quality Assurance & AQL Inspections',
    shortDescription: 'Multi-stage quality checkpoints adhering to international AQL 1.5 / 2.5 standards with certified on-site QC inspectors.',
    fullDescription: 'We operate an independent quality assurance division that inspects raw fabrics (4-Point System), monitors inline assembly (DPI), conducts pre-final checks (DUPRO), and issues final statistical inspections (FRI) before factory release.',
    iconName: 'ShieldCheck',
    capabilities: [
      'Fabric 4-point inspection and color fastness lab testing',
      'Daily inline sewing inspection and defect mapping',
      'Pre-final (DUPRO) and Final Random Inspection (FRI)',
      'Carton drop testing, barcode verification, and pull-test reports',
    ],
    deliverables: [
      'Comprehensive AQL Final Inspection Report (PDF)',
      'Fabric & Trims Inspection Certificates',
      'Defect Analysis and Corrective Action Plans',
    ],
  },
  {
    id: 'compliance',
    title: 'Ethical Compliance & Social Governance',
    shortDescription: 'Continuous oversight of factory labor welfare, structural safety, environmental licenses, and international buyer code of conduct.',
    fullDescription: 'We only partner with factories that meet or exceed statutory labor standards, fire safety guidelines, environmental clearances, and recognized social compliance benchmarks. Our compliance officers conduct periodic evaluations to ensure zero unauthorized subcontracting.',
    iconName: 'Scale',
    capabilities: [
      'Zero-tolerance policy on unauthorized factory subcontracting',
      'Periodic labor standard, minimum wage, and safety audits',
      'Chemical management and wastewater clearance verification',
      'Buyer-specific Code of Conduct implementation',
    ],
    deliverables: [
      'Factory Social Compliance Audit Summaries',
      'Safety and Building Integrity Certificates',
      'Chain-of-Custody Verification Documents',
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics Coordination & Export Clearance',
    shortDescription: 'Complete export documentation handling, customs clearing coordination, and vessel booking for reliable on-time delivery.',
    fullDescription: 'From ex-factory dispatch in Chittagong/Dhaka to vessel loading and container seal inspection. We manage packing lists, commercial invoices, certificates of origin, GSP/EUR.1 documentation, and forwarder handover.',
    iconName: 'Truck',
    capabilities: [
      'Commercial invoice, packing list, and bill of lading coordination',
      'Vessel booking and container stuffing surveillance',
      'Chittagong port and Dhaka airport export customs coordination',
      'Post-shipment tracking and courier dispatch of original docs',
    ],
    deliverables: [
      'Complete Export Shipping Document Package',
      'Forwarder Cargo Receipt (FCR) / Bill of Lading (B/L)',
      'Container Stuffing and Seal Confirmation Report',
    ],
  },
];

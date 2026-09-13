/**
 * Sourcing Capabilities & Technical Infrastructure.
 *
 * CONTENT INTEGRITY RULE:
 * Describes the intended operational workflow and technical capabilities.
 *
 * // CLIENT INPUT REQUIRED: Specific CAD systems in use, lab dip turnaround SLAs, and inspection tooling.
 */

export interface SourcingCapability {
  title: string;
  category: string;
  description: string;
  technicalHighlights: string[];
}

export const SOURCING_CAPABILITIES: SourcingCapability[] = [
  {
    title: 'Technical Merchandising & Pattern Engineering',
    category: 'Engineering & Design',
    description: 'Expert technical merchandising teams with deep knowledge of graded shrinkage calculations, seam engineering, and garment cost-down opportunities.',
    technicalHighlights: [
      'CAD Gerber / Lectra pattern grading and marker efficiency optimization',
      'Wash shrinkage compensation algorithms across circular knits and denim',
      'Alternative stitch and seam recommendation for structural durability',
      'Pre-costing BOM validation within 24-48 hours of tech pack receipt',
    ],
  },
  {
    title: 'Fabric Sourcing & Mill Network',
    category: 'Material Sourcing',
    description: 'Direct relationships with premier Bangladesh spinning, knitting, and weaving mills as well as duty-free bonded import channels for synthetic technical textiles.',
    technicalHighlights: [
      'Combed, carded, compact, slub, and melange cotton yarn sourcing',
      'Custom color lab dips matched via spectrophotometer (Delta E < 0.8)',
      'Bonded warehouse handling for imported performance trims and zippers',
      'Fabric lot-to-lot continuity and shade grouping protocols',
    ],
  },
  {
    title: 'Digital Production Telemetry & T&A Tracking',
    category: 'Supply Chain Operations',
    description: 'Proprietary production management system giving brand buyers complete milestone transparency and live updates from the factory floor.',
    technicalHighlights: [
      'Critical path milestone tracking against target ex-factory dates',
      'Daily sewing line loading and output data verification',
      'Early bottleneck warning triggers and emergency line re-allocation',
      'Centralized digital storage of lab dips, tech packs, and approvals',
    ],
  },
  {
    title: 'Certified Independent Quality Assurance',
    category: 'Quality Control',
    description: 'In-house certified QC inspection teams operating independently from factory management to ensure uncompromising adherence to buyer standards.',
    technicalHighlights: [
      'Full-time stationed QC controllers at every contracted production facility',
      'Strict adherence to ISO 2859-1 / ANSI/ASQ Z1.4 sampling tables',
      'Mobile digital inspection reporting with defect photo logs (Buyer Portal)',
      'Pull tests, barcode scans, and carton drop tests verified before release',
    ],
  },
];

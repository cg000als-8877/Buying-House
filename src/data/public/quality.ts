/**
 * Quality Assurance Framework & AQL Standards.
 *
 * CONTENT INTEGRITY RULE:
 * This dataset defines the designed multi-stage quality control architecture and standard
 * sampling thresholds implemented across managed apparel manufacturing programs.
 *
 * // CLIENT INPUT REQUIRED: Specific AQL default acceptance thresholds and on-site testing protocols.
 */

export interface QualityPillar {
  title: string;
  stage: string;
  standard: string;
  description: string;
  checkpoints: string[];
}

export const QUALITY_PILLARS: QualityPillar[] = [
  {
    title: 'Raw Material & Fabric Inspection',
    stage: 'Incoming Stage (0% Bulk Cutting)',
    standard: 'ASTM D5430 (4-Point System Standard)',
    description: 'Our quality framework is designed around inspecting raw fabric rolls to evaluate defect density, shade consistency, and dimensional stability prior to cutting allocation.',
    checkpoints: [
      '4-point defect grading per 100 sq. yards (Penalty limit < 28 points)',
      'Side-center-side shade variation & roll-to-roll continuity checks',
      'Dimensional stability to washing (shrinkage test ASTM D6207)',
      'Color fastness to washing, light, perspiration, and rubbing (crocking)',
    ],
  },
  {
    title: 'Pre-Production & Cutting Audit',
    stage: 'Pre-Sewing Stage (10% Production)',
    standard: 'Pattern & Tolerance Specification',
    description: 'Verifying pattern calibration, fabric relaxation times (24-48 hours), cut part measurement tolerances, and fusing temperature/pressure parameters.',
    checkpoints: [
      'Fabric relaxation duration and bundle ply height verification',
      'Cut panel measurement checks against graded paper patterns (±0.5 cm)',
      'Notch accuracy, grain line alignment, and bundle labeling',
      'Fusing bond strength and wash durability test',
    ],
  },
  {
    title: 'Inline Inspection & Process Control',
    stage: 'During Production (DPI - 20% to 50%)',
    standard: 'Continuous Line Traffic Light System',
    description: 'On-site QC technicians monitor sewing operations station-by-station, catching construction errors, tension irregularities, and needle holes before garment assembly completion.',
    checkpoints: [
      'Station-by-station critical operation defect tracking',
      'Seam strength, SPI (Stitches Per Inch) count, and tension balance',
      'Symmetric placement of pockets, collars, cuffs, and plackets',
      'Immediate machine recalibration upon repeat defect detection',
    ],
  },
  {
    title: 'Pre-Final & Final Inspection (FRI)',
    stage: 'Finished & Packed Stage (100% Ready / 80% Packed)',
    standard: 'ISO 2859-1 / ANSI/ASQ Z1.4 (AQL 1.5 / 2.5)',
    description: 'Statistical sampling of fully packed cartons to evaluate overall workmanship, packaging accuracy, carton drop durability, and conformity to buyer tech pack.',
    checkpoints: [
      'Full measurement inspection across all graded sizes in sample',
      'AQL 1.5 Major Defects / 2.5 Minor Defects acceptance threshold',
      'Barcode readability, carton labeling, polybag suffocation warnings',
      'Needle detection and metal contamination scan (1.0mm-1.2mm ferrous)',
    ],
  },
];

export const LAB_TESTING_PARAMETERS = [
  { test: 'Dimensional Stability / Shrinkage', method: 'ISO 6330 / AATCC 135', tolerance: '±3.0% to ±5.0%' },
  { test: 'Color Fastness to Washing', method: 'ISO 105-C06 / AATCC 61', tolerance: 'Grade 4-5' },
  { test: 'Color Fastness to Crocking (Dry/Wet)', method: 'ISO 105-X12 / AATCC 8', tolerance: 'Dry: 4-5 / Wet: 3-4' },
  { test: 'Pilling Resistance (Martindale)', method: 'ISO 12945-2 / ASTM D4970', tolerance: 'Grade 3-4 @ 2000 revs' },
  { test: 'Tear & Tensile Strength', method: 'ASTM D1424 / ISO 13934', tolerance: 'Conforms to buyer spec' },
  { test: 'Button & Snap Pull Force', method: 'ASTM F963 / 16 CFR 1500', tolerance: '> 90N for 10 seconds' },
];

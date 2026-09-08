/**
 * Social Compliance & Ethical Governance Standards.
 *
 * CONTENT INTEGRITY RULE:
 * Compliance pillars define the operational governance criteria and evaluation benchmarks
 * applied to partner facilities. Third-party audit certifications are published following
 * verified client/factory onboarding.
 *
 * // CLIENT INPUT REQUIRED: Specific third-party audit credentials, audit dates, and validity certificates.
 */

export interface ComplianceStandard {
  category: string;
  title: string;
  description: string;
  governanceMeasures: string[];
}

export const COMPLIANCE_STANDARDS: ComplianceStandard[] = [
  {
    category: 'Labor Welfare & Human Rights',
    title: 'Fair Wages, Working Hours & Worker Health',
    description: 'Enforcing statutory minimum wage compliance, transparent electronic payroll, overtime limitation governance, and zero child/forced labor protocols across all vendor facilities.',
    governanceMeasures: [
      'Electronic attendance and payroll record audits',
      'Maximum weekly working hours in compliance with Bangladesh Labor Act',
      'On-site medical clinics, certified nurses, and maternity welfare benefits',
      'Worker Participation Committees (WPC) and confidential grievance mechanisms',
    ],
  },
  {
    category: 'Structural & Fire Safety',
    title: 'Building Integrity, Fire Detection & Electrical Safety',
    description: 'Ensuring manufacturing partner facilities possess valid structural design approvals, automated fire suppression systems, and clear, unblocked emergency egress routes.',
    governanceMeasures: [
      'Structural engineering verification and approved load plans',
      'Addressable fire alarm and automated sprinkler systems',
      'Certified fire-rated exit doors with panic release hardware',
      'Monthly mandatory fire evacuation drills supervised by safety officers',
    ],
  },
  {
    category: 'Environmental & Chemical Governance',
    title: 'Effluent Treatment, Chemical Management & ZDHC Awareness',
    description: 'Monitoring wet processing facilities for biological Effluent Treatment Plants (ETP), chemical storage safety data sheets (MSDS), and hazardous substance restriction compliance.',
    governanceMeasures: [
      'Operational biological/chemical ETP water testing logs',
      'Manufacturing Restricted Substances List (MRSL / RSL) adherence',
      'Secondary containment for bulk chemical storage tanks',
      'Certified personal protective equipment (PPE) for chemical handlers',
    ],
  },
  {
    category: 'Supply Chain Transparency',
    title: 'Zero Unauthorized Subcontracting Policy',
    description: 'Every order is bound to designated, audited lines with mandatory traceability from yarn spinning and knitting/weaving through final packing.',
    governanceMeasures: [
      'Strict contractual prohibition of unauthorized external factory transfer',
      'Unannounced visits by our roving compliance auditing team',
      'Serial gate-pass and container dispatch verification',
      'Complete chain-of-custody documentation stored in Buyer Portal',
    ],
  },
];

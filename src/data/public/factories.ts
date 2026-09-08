/**
 * Factory Network Data Structure.
 *
 * CONTENT INTEGRITY RULE:
 * Real factory names, physical addresses, capacity numbers, and active certifications
 * must be verified by the client before publication.
 *
 * // CLIENT INPUT REQUIRED: Verified factory roster and audit credentials.
 */

export type ContentStatus = 'verified' | 'placeholder' | 'draft';

export interface FactoryPartner {
  id: string;
  name: string;
  location: string;
  category: string;
  specialization: string[];
  productCategories: string[];
  certificationsPlaceholder: string;
  approximateLines: string;
  monthlyCapacityPlaceholder: string;
  verificationStatus: ContentStatus;
  notes: string;
}

export const FACTORY_NETWORK_PROFILES: FactoryPartner[] = [
  {
    id: 'fac-unit-knitwear',
    name: 'Circular Knitwear Manufacturing Unit',
    location: 'Bangladesh Apparel Industrial Corridor [Details on Request]',
    category: 'Circular Knitwear',
    specialization: [
      'Single Jersey, Pique & Interlock',
      'French Terry & Brushed Fleece',
      'Screen & High-Density Printing',
    ],
    productCategories: ['Circular Knitwear', 'Loungewear'],
    certificationsPlaceholder: 'Certifications & audit reports pending client verification',
    approximateLines: 'To be confirmed upon factory audit',
    monthlyCapacityPlaceholder: 'Available on request',
    verificationStatus: 'placeholder',
    notes: 'Unit profile and machine specifications will be published upon verified client onboarding.',
  },
  {
    id: 'fac-unit-woven',
    name: 'Woven Tops & Bottoms Manufacturing Unit',
    location: 'Bangladesh Apparel Industrial Corridor [Details on Request]',
    category: 'Woven Apparel',
    specialization: [
      'Casual & Dress Shirting',
      'Chino Trousers & Cargo Pants',
      'Structured Twills & Poplin Weaves',
    ],
    productCategories: ['Woven Tops & Bottoms'],
    certificationsPlaceholder: 'Certifications & audit reports pending client verification',
    approximateLines: 'To be confirmed upon factory audit',
    monthlyCapacityPlaceholder: 'Available on request',
    verificationStatus: 'placeholder',
    notes: 'Unit profile and line allocations will be published upon verified client onboarding.',
  },
  {
    id: 'fac-unit-denim',
    name: 'Denim & Washed Apparel Manufacturing Unit',
    location: 'Bangladesh Apparel Industrial Corridor [Details on Request]',
    category: 'Denim & Washed Wear',
    specialization: [
      '5-Pocket Denim Jeans & Jackets',
      'Laser Patterning & Ozone Washing',
      'Enzyme & Stone Wash Formulations',
    ],
    productCategories: ['Denim & Washed Apparel'],
    certificationsPlaceholder: 'Certifications & audit reports pending client verification',
    approximateLines: 'To be confirmed upon factory audit',
    monthlyCapacityPlaceholder: 'Available on request',
    verificationStatus: 'placeholder',
    notes: 'Unit profile and laundry technology specifications will be published upon verified client onboarding.',
  },
  {
    id: 'fac-unit-outerwear',
    name: 'Outerwear & Technical Apparel Manufacturing Unit',
    location: 'Bangladesh Apparel Industrial Corridor [Details on Request]',
    category: 'Outerwear & Technical',
    specialization: [
      'Quilted Puffer Jackets & Vests',
      'Taped Seam Shell Jackets',
      'Bonded Softshell & Fleece Laminates',
    ],
    productCategories: ['Outerwear & Technical Apparel'],
    certificationsPlaceholder: 'Certifications & audit reports pending client verification',
    approximateLines: 'To be confirmed upon factory audit',
    monthlyCapacityPlaceholder: 'Available on request',
    verificationStatus: 'placeholder',
    notes: 'Unit profile and seam-sealing machinery lists will be published upon verified client onboarding.',
  },
];

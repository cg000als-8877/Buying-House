/**
 * Sustainability Framework & Responsible Sourcing Data.
 *
 * CONTENT INTEGRITY RULE:
 * This data outlines prospective eco-conscious initiatives and material sourcing pathways.
 * Specific certifications (e.g. GOTS, GRS, OEKO-TEX) and environmental metrics require
 * verified mill partner confirmation before public claim.
 *
 * // CLIENT INPUT REQUIRED: Verified sustainable fiber options, laundry mill accreditations, and environmental data.
 */

export interface SustainabilityGoal {
  title: string;
  focusArea: string;
  description: string;
  initiatives: string[];
}

export const SUSTAINABILITY_GOALS: SustainabilityGoal[] = [
  {
    title: 'Eco-Certified & Regenerative Fibers',
    focusArea: 'Material Sourcing',
    description: 'Expanding buyer access to GOTS certified organic cotton, GRS certified recycled polyester, BCI cotton, and Lenzing EcoVero viscose fibers.',
    initiatives: [
      'Verified chain-of-custody transaction certificates (TC) for organic yarns',
      'Post-consumer recycled polyester blends for outerwear and activewear',
      'Pre-consumer spinning mill waste recycling integration',
      'Linen, hemp, and sustainably harvested cellulosic fiber sourcing',
    ],
  },
  {
    title: 'Water Stewardship & Ozone Laundering',
    focusArea: 'Wet Processing Efficiency',
    description: 'Guiding denim and garment wash programs toward low-liquor-ratio machines, laser patterning, and ozone washing systems to drastically lower water and chemical intensity.',
    initiatives: [
      'Transition to laser distressing in place of manual sandblasting',
      'Ozone bleach replacement reducing water consumption up to 65%',
      'Low-temperature reactive dyes for reduced thermal energy usage',
      'Real-time water metering on industrial laundry lines',
    ],
  },
  {
    title: 'Renewable Energy & Thermal Conservation',
    focusArea: 'Energy & Emissions',
    description: 'Prioritizing vendor facilities investing in rooftop solar photovoltaic installations, condensate recovery boilers, and energy-efficient servo-motor sewing machines.',
    initiatives: [
      'Promotion of LEED-certified green factory facilities in Bangladesh',
      'Exhaust heat recovery boilers in dyeing and finishing units',
      'High-efficiency LED factory floor lighting retrofit programs',
      'Supply chain carbon footprint tracking preparation',
    ],
  },
  {
    title: 'Responsible Packaging & Circularity',
    focusArea: 'Packaging & Waste Management',
    description: 'Advising brands on recycled polybags (GRS certified), FSC certified paper hangtags, and bulk carton consolidation to eliminate single-use plastics.',
    initiatives: [
      '100% recycled or biodegradable master polybags',
      'Soy-based ink printing on FSC certified carton boxes and tags',
      'Fabric cutting room scrap (Jhoot) sorting for regional recycling loops',
      'Optimized container packing ratios to minimize shipping freight volume',
    ],
  },
];

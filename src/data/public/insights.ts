/**
 * Apparel Sourcing Insights & Technical Knowledge.
 *
 * CONTENT INTEGRITY RULE:
 * Editorial articles provide technical sourcing education and methodology guidelines.
 *
 * // CLIENT INPUT REQUIRED: Client-authored technical briefs, market updates, and case studies.
 */

export interface InsightArticle {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  summary: string;
  topics: string[];
}

export const INSIGHTS_ARTICLES: InsightArticle[] = [
  {
    slug: 'bangladesh-apparel-sourcing-guide',
    title: 'A Buyer’s Guide to Apparel Sourcing in Bangladesh',
    category: 'Sourcing Strategy',
    readTime: '6 min read',
    date: '2026-08-15',
    summary: 'Essential factors international brand buyers must evaluate when placing circular knit, woven, and denim collections in Bangladesh.',
    topics: ['Lead Times', 'MOQ Structures', 'Port Logistics', 'Duty Benefits'],
  },
  {
    slug: 'understanding-aql-quality-standards',
    title: 'Understanding AQL 1.5 vs 2.5 in Garment Manufacturing',
    category: 'Quality Assurance',
    readTime: '5 min read',
    date: '2026-07-28',
    summary: 'How statistical sampling tables, major vs minor defect classification, and FRI inspections protect retail brand integrity.',
    topics: ['AQL Tables', 'Defect Classification', 'Sample Sizes', 'Inspection Pass/Fail'],
  },
  {
    slug: 'tech-pack-preparation-best-practices',
    title: 'How to Prepare Tech Packs for Faster Sample Turnaround',
    category: 'Technical Development',
    readTime: '4 min read',
    date: '2026-06-12',
    summary: 'The critical specifications, graded measurements, and BOM details buying houses need to deliver accurate Proto samples on the first submission.',
    topics: ['BOM Details', 'Graded Specs', 'Stitch Instructions', 'Packaging Guidelines'],
  },
  {
    slug: 'sustainable-denim-laundering-innovations',
    title: 'Modern Denim Laundry: Ozone & Laser Technology',
    category: 'Sustainability',
    readTime: '5 min read',
    date: '2026-05-20',
    summary: 'How innovative washing units in Bangladesh are conserving water and eliminating harsh chemicals in commercial denim processing.',
    topics: ['Ozone Wash', 'Laser Scraping', 'Water Conservation', 'Eco Finishes'],
  },
];

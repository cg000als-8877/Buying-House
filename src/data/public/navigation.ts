export interface NavItem {
  name: string;
  href: string;
  description?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about', description: 'Our buying house mission, vision, and operations' },
  { name: 'Services', href: '/services', description: 'End-to-end apparel sourcing, sampling & production management' },
  { name: 'Products', href: '/products', description: 'Apparel manufacturing capabilities across knit, woven & outerwear' },
  { name: 'Capabilities', href: '/capabilities', description: 'Supply chain telemetry, vendor network & technical execution' },
  { name: 'Quality', href: '/quality', description: 'AQL inspection frameworks & rigorous inline quality control' },
  { name: 'Compliance', href: '/compliance', description: 'Social compliance, building safety & ethical standards' },
  { name: 'Sustainability', href: '/sustainability', description: 'Responsible materials, OEKO-TEX & eco-conscious manufacturing' },
  { name: 'Factories', href: '/factories', description: 'Audited partner factory network & production hubs' },
  { name: 'Insights', href: '/insights', description: 'Apparel sourcing guides, technical briefs & market updates' },
  { name: 'Contact', href: '/contact', description: 'Submit sourcing RFQ or discuss collection requirements' },
];

export const FOOTER_SECTIONS = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Capabilities', href: '/capabilities' },
    { name: 'Factory Network', href: '/factories' },
    { name: 'Sourcing Insights', href: '/insights' },
    { name: 'Contact / RFQ', href: '/contact' },
  ],
  services: [
    { name: 'Product Development & Sampling', href: '/services#sampling' },
    { name: 'Vendor Sourcing & Costing', href: '/services#sourcing' },
    { name: 'Production Line Telemetry', href: '/services#production' },
    { name: 'AQL Quality Assurance', href: '/quality' },
    { name: 'Social & Factory Compliance', href: '/compliance' },
    { name: 'Logistics & Export Documentation', href: '/services#logistics' },
  ],
  products: [
    { name: 'Circular Knitwear', href: '/products#knitwear' },
    { name: 'Woven Tops & Bottoms', href: '/products#woven' },
    { name: 'Denim & Washed Apparel', href: '/products#denim' },
    { name: 'Outerwear & Jackets', href: '/products#outerwear' },
    { name: 'Performance Activewear', href: '/products#activewear' },
  ],
  governance: [
    { name: 'Quality Manual', href: '/quality' },
    { name: 'Compliance Policy', href: '/compliance' },
    { name: 'Sustainability Framework', href: '/sustainability' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ],
};

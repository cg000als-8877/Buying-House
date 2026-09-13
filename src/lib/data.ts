import { Product, Certification, Service } from '@/types';

export const productsData: Product[] = [
  {
    id: 'prod-1',
    name: 'Luxury Pima Cotton Heavyweight Tee',
    category: 'Knitwear',
    fabric: '100% Peruvian Pima Cotton / Compact Combed',
    gsm: '240 - 280 GSM',
    moq: '500 pcs/color',
    leadTime: '30-45 days',
    image: '/images/knitwear.webp',
    features: ['Pre-shrunk', 'Silicon Soft Wash', 'Double-needle seam', 'Rib collar retention'],
    certifications: ['OEKO-TEX 100', 'GOTS Organic'],
    description: 'Ultra-luxurious heavyweight t-shirt tailored for premium streetwear and contemporary fashion labels. Exceptional hand-feel with zero twisting after wash.'
  },
  {
    id: 'prod-2',
    name: 'Organic Brushed French Terry Hoodie',
    category: 'Knitwear',
    fabric: '100% Organic Cotton or 80/20 CVC',
    gsm: '380 - 450 GSM',
    moq: '300 pcs/color',
    leadTime: '35-50 days',
    image: '/images/knitwear.webp',
    features: ['Brushed fleece interior', 'Heavy ribbed cuffs & hem', 'Custom metal tipped aglets', 'Double-layer hood'],
    certifications: ['OEKO-TEX 100', 'GOTS', 'WRAP Certified'],
    description: 'High-density heavyweight fleece pullover engineered for luxury comfort, warmth, and streetwear structured silhouette.'
  },
  {
    id: 'prod-3',
    name: 'Selvedge Heritage Denim Jacket',
    category: 'Denim',
    fabric: '100% Ring Spun Selvedge Denim',
    gsm: '13.5 oz / 460 GSM',
    moq: '400 pcs/style',
    leadTime: '45-60 days',
    image: '/images/denim.webp',
    features: ['Shuttle-loom selvedge ID line', 'Antiqued brass hardware', 'Vintage hand-scrape wash', 'Reinforced bartack stitching'],
    certifications: ['BCI Cotton', 'Sedex SMETA', 'OEKO-TEX'],
    description: 'Authentic selvedge denim jacket combining heritage craftsmanship with modern laser and ozone eco-washing techniques.'
  },
  {
    id: 'prod-4',
    name: 'Tech-Performance Seamless Leggings',
    category: 'Activewear',
    fabric: '75% Recycled Nylon, 25% Spandex (Lycra)',
    gsm: '220 GSM',
    moq: '500 pcs/color',
    leadTime: '30-40 days',
    image: '/images/activewear.webp',
    features: ['4-way stretch', 'Squat-proof compression', 'Moisture-wicking', 'Anti-microbial finish'],
    certifications: ['GRS (Global Recycled Standard)', 'OEKO-TEX'],
    description: 'Butter-soft high-waisted seamless activewear leggings built for high-impact performance and athleisure lines.'
  },
  {
    id: 'prod-5',
    name: 'Tailored Linen-Cotton Resort Shirt',
    category: 'Woven',
    fabric: '55% French Linen, 45% Combed Cotton',
    gsm: '160 GSM',
    moq: '400 pcs/pattern',
    leadTime: '35-45 days',
    image: '/images/woven.webp',
    features: ['Camp collar', 'Mother-of-pearl buttons', 'Enzyme garment washed', 'Breathable open weave'],
    certifications: ['European Flax', 'OEKO-TEX 100'],
    description: 'Effortlessly refined summer resort shirt offering breathable drape, natural texture, and relaxed luxury aesthetics.'
  },
  {
    id: 'prod-6',
    name: 'Recycled Down Packable Puffer Jacket',
    category: 'Outerwear',
    fabric: '100% Recycled Ripstop Nylon / 90/10 RDS Down Fill',
    gsm: '350 GSM total weight',
    moq: '300 pcs/style',
    leadTime: '50-65 days',
    image: '/images/outerwear.webp',
    features: ['DWR water-repellent finish', '700+ Fill Power RDS certified down', 'YKK AquaGuard zippers', 'Packable pouch included'],
    certifications: ['RDS (Responsible Down)', 'GRS', 'bluesign® Approved'],
    description: 'Ultra-lightweight thermal insulation outerwear combining weather protection with sustainable recycled shell materials.'
  }
];

export const certificationsData: Certification[] = [
  {
    id: 'oeko-tex',
    name: 'OEKO-TEX® Standard 100',
    category: 'Quality',
    issuer: 'International OEKO-TEX Association',
    logo: '🌿',
    description: 'Guarantees that textile products are tested against over 1,000 harmful substances and are completely safe for human ecological health.',
    validity: 'Annual Certified Renewal'
  },
  {
    id: 'gots',
    name: 'GOTS (Global Organic Textile Standard)',
    category: 'Environmental',
    issuer: 'GOTS International Working Group',
    logo: '🌱',
    description: 'The worldwide leading textile processing standard for organic fibres, including ecological and social criteria throughout the entire supply chain.',
    validity: 'Certified Grade 1'
  },
  {
    id: 'bsci',
    name: 'Amfori BSCI',
    category: 'Social',
    issuer: 'Amfori Global',
    logo: '🤝',
    description: 'Audits social compliance, fair wages, workplace safety, and ethical labor standards across all partner manufacturing facilities.',
    validity: 'A-Grade Rating'
  },
  {
    id: 'sedex',
    name: 'Sedex SMETA 4-Pillar',
    category: 'Social',
    issuer: 'Sedex Information Exchange',
    logo: '🛡️',
    description: 'Auditing labor standards, health and safety, environmental assessment, and business ethics.',
    validity: 'Verified Audit'
  },
  {
    id: 'grs',
    name: 'GRS (Global Recycled Standard)',
    category: 'Environmental',
    issuer: 'Textile Exchange',
    logo: '♻️',
    description: 'Tracks and verifies recycled materials from source to final garment, ensuring chain of custody and chemical restrictions.',
    validity: 'Active Tier 1'
  },
  {
    id: 'wrap',
    name: 'WRAP (Worldwide Responsible Accredited Production)',
    category: 'Social',
    issuer: 'WRAP Compliance Board',
    logo: '🏆',
    description: 'Gold-level certification ensuring lawful, humane, and ethical manufacturing principles.',
    validity: 'Gold Certificate'
  }
];

export const servicesData: Service[] = [
  {
    id: 'sourcing',
    title: 'Global Fabric & Trim Sourcing',
    shortDesc: 'Access to top spinning mills, eco-friendly yarn producers, and specialized trims worldwide.',
    fullDesc: 'We curate proprietary fabric libraries, customize lab-dips with 100% Pantone accuracy, and source certified organic, recycled, and technical fabrics tailored to your exact hand-feel and drape specifications.',
    icon: 'Layers',
    metrics: '500+ Mill Partners'
  },
  {
    id: 'techpack',
    title: 'R&D, Pattern & Tech-Pack Engineering',
    shortDesc: 'Turning sketches and concepts into production-ready samples with 3D fitting & grading.',
    fullDesc: 'Our in-house master pattern makers and 3D CAD specialists produce comprehensive tech packs, graded size charts (US, UK, EU, Asian fit), and prototype samples in 5-7 business days.',
    icon: 'Ruler',
    metrics: '5-Day Sample Turnaround'
  },
  {
    id: 'manufacturing',
    title: 'Precision Ethical Manufacturing',
    shortDesc: 'Audited factories specialized in knit, woven, denim, seamless, and heavy outerwear.',
    fullDesc: 'State-of-the-art automated cutting, laser finishing, and Japanese sewing assembly lines ensure consistency across small batch (300 pcs) to high volume (500,000+ pcs) production runs.',
    icon: 'Factory',
    metrics: '2.5M Pcs Monthly Capacity'
  },
  {
    id: 'quality',
    title: 'AQL 1.5 / 2.5 Quality Assurance',
    shortDesc: 'Strict 4-stage inline and pre-shipment inspections by dedicated certified QA engineers.',
    fullDesc: 'From yarn testing, fabric shrinkage, color fastness, pull-tests to 100% finished garment checks, our QA teams operate independently inside factories to eliminate defects before packaging.',
    icon: 'ShieldCheck',
    metrics: '99.4% Flawless Rate'
  },
  {
    id: 'logistics',
    title: 'Door-to-Door Global Logistics & Customs',
    shortDesc: 'FOB, CIF, DDP shipping with seamless customs clearance to EU, USA, UK, and worldwide.',
    fullDesc: 'We handle export documentation, preferential duty schemes (GSP, EUR.1), vessel booking, air-freight consolidation, and direct warehousing deliveries.',
    icon: 'Truck',
    metrics: '45+ Destination Countries'
  },
  {
    id: 'sustainability',
    title: 'Circular & Sustainable Production',
    shortDesc: 'Zero-discharge water recycling, solar-powered facilities, and biodegradable packaging.',
    fullDesc: 'Help your brand achieve net-zero milestones with traceable supply chains, recycled polyester, organic cotton, and eco-friendly garment washes.',
    icon: 'Sparkles',
    metrics: '100% Traceable Chain'
  }
];

export const clientTestimonials = [
  {
    id: '1',
    quote: "Working with this team transformed our brand's production cycle. Our sample approval time was cut in half, and the fabric hand-feel exceeded our expectations for our European stores.",
    clientName: "Marcello Rossi",
    role: "Head of Sourcing",
    brand: "Nordic Atelier (Stockholm, Sweden)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: '2',
    quote: "Their strict AQL 1.5 inspection standards gave us complete peace of mind. Out of 85,000 units shipped to our US fulfillment centers, our return rate was less than 0.2%.",
    clientName: "Eleanor Vance",
    role: "VP of Supply Chain",
    brand: "Vanguard Apparel (New York, USA)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: '3',
    quote: "Finding a manufacturing partner that combines low MOQs, GOTS certified organics, and high-fashion tailoring is rare. They are an indispensable extension of our design studio.",
    clientName: "Liam Henderson",
    role: "Creative Director",
    brand: "Kuro Studio (London, UK)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
  }
];

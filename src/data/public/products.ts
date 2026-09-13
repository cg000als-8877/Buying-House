/**
 * Apparel Product Categories Data Structure.
 *
 * CONTENT INTEGRITY RULE:
 * Product categories are presented as illustrative manufacturing capabilities.
 * Specific MOQs, production lead times, and fabric availability depend on style complexity
 * and factory allocation, requiring confirmation upon RFQ review.
 *
 * // CLIENT INPUT REQUIRED: Exact garment categories, certified fabric compositions, and commercial MOQ thresholds.
 */

export interface ProductCategory {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image?: string;
  leadTimeWeeks: string;
  moqPlaceholder: string;
  fabricTypes: string[];
  keyGarments: string[];
  specialFinishes: string[];
}

export const PRODUCT_CATEGORIES_DATA: ProductCategory[] = [
  {
    id: 'knitwear',
    name: 'Circular Knitwear',
    subtitle: 'T-Shirts, Polo Shirts, Hoodies, Sweatshirts & Loungewear',
    description: 'Circular knit manufacturing capabilities covering single jersey, pique, interlock, french terry, and fleece across standard and custom yarn counts.',
    image: '/images/knitwear.webp',
    leadTimeWeeks: 'To be confirmed based on styling & fabric',
    moqPlaceholder: 'Available on request',
    fabricTypes: [
      '100% Combed Cotton Single Jersey (Varied GSM)',
      'Cotton / Elastane Blends',
      'CVC & TC Pique Mesh',
      'French Terry & Brushed Fleece',
      'Organic Cotton Sourcing Options',
    ],
    keyGarments: [
      'Crewneck & V-neck T-Shirts',
      'Classic & Tailored Polo Shirts',
      'Pullover & Zip-up Hoodies',
      'Joggers, Sweatpants & Tracksuits',
      'Tank Tops & Base Layers',
    ],
    specialFinishes: [
      'Silicon & Enzyme Bio-Wash',
      'Screen & High-Density Printing',
      'Discharge & Pigment Print',
      'Anti-Pilling & Peach Finish',
    ],
  },
  {
    id: 'woven',
    name: 'Woven Tops & Bottoms',
    subtitle: 'Dress Shirts, Casual Flannels, Cargo Pants & Chinos',
    description: 'Woven manufacturing scope across shirting fabrics, twills, canvas, poplin, and structured technical blends.',
    image: '/images/woven.webp',
    leadTimeWeeks: 'To be confirmed based on styling & fabric',
    moqPlaceholder: 'Available on request',
    fabricTypes: [
      'Cotton Poplin & Oxford Weave',
      'Yarn-Dyed Flannel & Checks',
      'Cotton Twill & Canvas',
      'Cellulosic & Linen Blends',
      'Nylon & Polyester Stretch Blends',
    ],
    keyGarments: [
      'Button-down Casual & Formal Shirts',
      'Tailored Chino Pants & Shorts',
      'Multi-Pocket Cargo Trousers',
      'Utility Overshirts & Workwear',
      'Casual Woven Dresses & Blouses',
    ],
    specialFinishes: [
      'Easy-Care & Soft Wash Treatments',
      'Garment Dye & Mineral Wash',
      'Water-Repellent (DWR) Coating Options',
      'Sanded Soft Touch Finishes',
    ],
  },
  {
    id: 'denim',
    name: 'Denim & Washed Apparel',
    subtitle: 'Jeans, Denim Jackets, Overshirts & Western Shirts',
    description: 'Denim manufacturing capabilities with access to industrial laundry facilities supporting ozone, laser patterning, and standard wash recipes.',
    image: '/images/denim.webp',
    leadTimeWeeks: 'To be confirmed based on styling & fabric',
    moqPlaceholder: 'Available on request',
    fabricTypes: [
      'Rigid & Comfort-Stretch Indigo Denim',
      'Cotton / Polyester / Elastane Blends',
      'Recycled Cotton Blend Denim Options',
      'Colored Twill & Bull Denim',
    ],
    keyGarments: [
      '5-Pocket Slim, Straight & Relaxed Jeans',
      'Classic Trucker Denim Jackets',
      'Western Snap Shirts & Vests',
      'Denim Shorts & Skirts',
    ],
    specialFinishes: [
      'Laser Whisker & Scrape Effects',
      'Enzyme, Stone & Bleach Washes',
      'Ozone Wash Formulations',
      'Rinse, Tint & Resin Bake Finishes',
    ],
  },
  {
    id: 'outerwear',
    name: 'Outerwear & Jackets',
    subtitle: 'Puffer Jackets, Windbreakers, Parkas & Technical Vests',
    description: 'Outerwear production capabilities equipped with seam sealing, synthetic insulation filling, and weather-resistant shell construction.',
    image: '/images/outerwear.webp',
    leadTimeWeeks: 'To be confirmed based on styling & fabric',
    moqPlaceholder: 'Available on request',
    fabricTypes: [
      'Nylon Ripstop with Membrane Backing',
      'Polyester Taslan & Pongee Shells',
      'Bonded Softshell (Fleece Laminated)',
      'Synthetic Polyfill & Thermal Insulation',
    ],
    keyGarments: [
      'Quilted Puffer Jackets & Vests',
      'Lightweight Packable Windbreakers',
      'Hooded Winter Parkas & Anoraks',
      'Technical Softshell Jackets',
    ],
    specialFinishes: [
      'Water-Resistant Membrane & Seam Taping Options',
      'Reflective Safety Taping & Zippers',
      'DWR Finish Coatings',
      'Heat-Sealed Baffle Construction',
    ],
  },
  {
    id: 'activewear',
    name: 'Performance Activewear',
    subtitle: 'Gymwear, Leggings, Seamless Tops & Sports Apparel',
    description: 'Athletic apparel manufacturing scope featuring flatlock stitching, multi-way stretch fabrics, and moisture management finishes.',
    image: '/images/activewear.webp',
    leadTimeWeeks: 'To be confirmed based on styling & fabric',
    moqPlaceholder: 'Available on request',
    fabricTypes: [
      'Polyester / Elastane Interlock',
      'Nylon / Elastane Rib Knits',
      'Recycled Poly Interlock Options',
      'Breathable Mesh Panels',
    ],
    keyGarments: [
      'Compression Leggings & Biker Shorts',
      'Athletic Raglan T-Shirts & Tanks',
      'Sports Tops & Training Bras',
      'Zip Training Track Jackets',
    ],
    specialFinishes: [
      'Quick-Dry & Moisture Wicking Treatments',
      'Antimicrobial / Anti-Odor Treatments',
      'Sublimation All-Over Printing',
      'Flatlock Anti-Chafing Seams',
    ],
  },
  {
    id: 'sustainable',
    name: 'Organic & Sustainable Lines',
    subtitle: 'GOTS Organic Cotton, Belgian Linen & Recycled Blends',
    description: 'Eco-conscious sourcing and production utilizing certified organic cotton, botanical low-impact dyeing, and recycled fiber yarns.',
    image: '/images/sustainable.webp',
    leadTimeWeeks: 'To be confirmed based on styling & fabric',
    moqPlaceholder: 'Available on request',
    fabricTypes: [
      '100% GOTS Certified Organic Cotton',
      'European Pure Linen & Hemp Weaves',
      'GRS Certified Recycled Polyester',
      'TENCEL™ Lyocell & Modal Blends',
    ],
    keyGarments: [
      'Eco-Jersey Basics & Tees',
      'Pure Linen Resort Shirts & Trousers',
      'Recycled Poly Fleece Hoodies',
      'Zero-Waste Loungewear Sets',
    ],
    specialFinishes: [
      'Natural Botanical & Mineral Dyes',
      'Zero-Discharge Eco-Washing',
      'Biodegradable Garment Packaging',
      'Oeko-Tex Standard 100 Trims',
    ],
  },
];

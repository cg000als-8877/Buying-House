export type ProductCategory = 'Knitwear' | 'Woven' | 'Denim' | 'Activewear' | 'Outerwear' | 'Sustainable';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  fabric: string;
  gsm: string;
  moq: string;
  leadTime: string;
  image: string;
  features: string[];
  certifications: string[];
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  category: 'Quality' | 'Social' | 'Environmental';
  issuer: string;
  logo: string;
  description: string;
  validity: string;
}

export interface Service {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  metrics: string;
}

export interface RFQSubmission {
  companyName: string;
  buyerName: string;
  email: string;
  phone: string;
  country: string;
  productCategory: string;
  estimatedQuantity: string;
  targetPrice?: string;
  fabricPreference?: string;
  deliveryTimeline: string;
  techPackUrl?: string;
  comments?: string;
}

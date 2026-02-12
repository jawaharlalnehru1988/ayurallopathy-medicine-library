
export enum MedicineCategory {
  AYURVEDIC = 'Ayurvedic',
  ALLOPATHIC = 'Allopathic',
  HOMEOPATHIC = 'Homeopathic',
  OTHER = 'Other'
}

export enum DiseaseSeverity {
  MILD = 'Mild',
  MEDIUM = 'Medium',
  CHRONIC = 'Chronic'
}

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: MedicineCategory;
  quantity: number;
  unit: string;
  expiryDate: string;
  manufactureDate?: string;
  description: string;
  dosageInstructions?: string;
  ingredients?: string[];
  sideEffects?: string[];
  benefits?: string[];
  lastUpdated: string;
  location?: string;
}

export interface Disease {
  id: string;
  name: string;
  symptoms: string[];
  severity: DiseaseSeverity;
  diagnosingMethods: string[];
  rootCauses: string[];
  solutions: string[];
  specialist: string;
  lastUpdated: string;
}

export interface InventoryStats {
  totalItems: number;
  expiringSoon: number;
  expired: number;
  lowStock: number;
  categoryDistribution: { name: string; value: number }[];
}

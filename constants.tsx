
import React from 'react';
import { Medicine, MedicineCategory } from './types';

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: '1',
    name: 'Ashwagandha Churna',
    brand: 'Patanjali',
    category: MedicineCategory.AYURVEDIC,
    quantity: 5,
    unit: 'Bottles (100g)',
    expiryDate: '2025-12-30',
    description: 'Traditional Ayurvedic herb for stress and energy.',
    lastUpdated: new Date().toISOString(),
    ingredients: ['Withania somnifera']
  },
  {
    id: '2',
    name: 'Paracetamol',
    brand: 'GSK',
    category: MedicineCategory.ALLOPATHIC,
    quantity: 12,
    unit: 'Strips (10 tabs)',
    expiryDate: '2024-05-15',
    description: 'Analgesic and antipyretic for fever and pain.',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Triphala Guggulu',
    brand: 'Baidyanath',
    category: MedicineCategory.AYURVEDIC,
    quantity: 2,
    unit: 'Bottles (60 tabs)',
    expiryDate: '2023-10-10',
    description: 'Used for detoxification and joint health.',
    lastUpdated: new Date().toISOString()
  }
];

export const CATEGORY_COLORS: Record<MedicineCategory, string> = {
  [MedicineCategory.AYURVEDIC]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [MedicineCategory.ALLOPATHIC]: 'bg-blue-100 text-blue-700 border-blue-200',
  [MedicineCategory.HOMEOPATHIC]: 'bg-purple-100 text-purple-700 border-purple-200',
  [MedicineCategory.OTHER]: 'bg-gray-100 text-gray-700 border-gray-200',
};

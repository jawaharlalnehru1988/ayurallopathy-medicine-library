/// <reference types="vite/client" />
import { Medicine, MedicineCategory } from '../types';

// Configure your API base URL
// Use import.meta.env for Vite, fallback to process.env if available (for compatibility), or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/medicines';

export interface MedicineResponse {
  id: number;
  name: string;
  brand: string;
  category: MedicineCategory;
  quantity: number;
  unit: string;
  expiryDate: string; // LocalDate in backend, comes as string
  manufactureDate?: string;
  description: string;
  dosageInstructions?: string;
  ingredients: string[];
  sideEffects: string[];
  benefits: string[];
  location?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface MedicineCreateRequest {
  name: string;
  brand?: string;
  category: MedicineCategory;
  quantity: number;
  unit?: string;
  expiryDate: string;
  manufactureDate?: string;
  description?: string;
  dosageInstructions?: string;
  ingredients?: string[];
  sideEffects?: string[];
  benefits?: string[];
  location?: string;
}

export interface MedicineUpdateRequest {
  name?: string;
  brand?: string;
  category?: MedicineCategory;
  quantity?: number;
  unit?: string;
  expiryDate?: string;
  manufactureDate?: string;
  description?: string;
  dosageInstructions?: string;
  ingredients?: string[];
  sideEffects?: string[];
  benefits?: string[];
  location?: string;
}

// Convert backend response to frontend Medicine type
const toMedicine = (response: MedicineResponse): Medicine => ({
  id: response.id.toString(),
  name: response.name,
  brand: response.brand || '',
  category: response.category,
  quantity: response.quantity,
  unit: response.unit,
  expiryDate: response.expiryDate,
  manufactureDate: response.manufactureDate,
  description: response.description || '',
  dosageInstructions: response.dosageInstructions,
  ingredients: response.ingredients || [],
  sideEffects: response.sideEffects || [],
  benefits: response.benefits || [],
  location: response.location,
  lastUpdated: response.lastUpdated,
});

// Convert frontend Medicine to backend request
const toCreateRequest = (medicine: Partial<Medicine>): MedicineCreateRequest => ({
  name: medicine.name!,
  brand: medicine.brand,
  category: medicine.category || MedicineCategory.AYURVEDIC,
  quantity: medicine.quantity || 0,
  unit: medicine.unit,
  expiryDate: medicine.expiryDate!,
  manufactureDate: medicine.manufactureDate,
  description: medicine.description,
  dosageInstructions: medicine.dosageInstructions,
  ingredients: medicine.ingredients || [],
  sideEffects: medicine.sideEffects || [],
  benefits: medicine.benefits || [],
  location: medicine.location,
});

// Helper for fetching with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// API Methods
export const medicineApi = {
  // Get all medicines
  async getAll(): Promise<Medicine[]> {
    const response = await fetchWithTimeout(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch medicines: ${response.statusText}`);
    }
    const data: MedicineResponse[] = await response.json();
    return data.map(toMedicine);
  },

  // Get medicine by ID
  async getById(id: string): Promise<Medicine> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch medicine: ${response.statusText}`);
    }
    const data: MedicineResponse = await response.json();
    return toMedicine(data);
  },

  // Create new medicine
  async create(medicine: Partial<Medicine>): Promise<Medicine> {
    const response = await fetchWithTimeout(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toCreateRequest(medicine)),
    });
    if (!response.ok) {
      throw new Error(`Failed to create medicine: ${response.statusText}`);
    }
    const data: MedicineResponse = await response.json();
    return toMedicine(data);
  },

  // Update existing medicine
  async update(id: string, medicine: Partial<Medicine>): Promise<Medicine> {
    const updateRequest: MedicineUpdateRequest = {
      name: medicine.name,
      brand: medicine.brand,
      category: medicine.category,
      quantity: medicine.quantity,
      unit: medicine.unit,
      expiryDate: medicine.expiryDate,
      manufactureDate: medicine.manufactureDate,
      description: medicine.description,
      dosageInstructions: medicine.dosageInstructions,
      ingredients: medicine.ingredients,
      sideEffects: medicine.sideEffects,
      benefits: medicine.benefits,
      location: medicine.location,
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateRequest),
    });
    if (!response.ok) {
      throw new Error(`Failed to update medicine: ${response.statusText}`);
    }
    const data: MedicineResponse = await response.json();
    return toMedicine(data);
  },

  // Delete medicine
  async delete(id: string): Promise<void> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete medicine: ${response.statusText}`);
    }
  },

  // Get medicines by category
  async getByCategory(category: MedicineCategory): Promise<Medicine[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/category/${category}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch medicines by category: ${response.statusText}`);
    }
    const data: MedicineResponse[] = await response.json();
    return data.map(toMedicine);
  },

  // Search medicines by name
  async searchByName(name: string): Promise<Medicine[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error(`Failed to search medicines: ${response.statusText}`);
    }
    const data: MedicineResponse[] = await response.json();
    return data.map(toMedicine);
  },

  // Get expiring soon medicines
  async getExpiringSoon(days: number = 30): Promise<Medicine[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/expiring-soon?days=${days}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch expiring medicines: ${response.statusText}`);
    }
    const data: MedicineResponse[] = await response.json();
    return data.map(toMedicine);
  },

  // Get expired medicines
  async getExpired(): Promise<Medicine[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/expired`);
    if (!response.ok) {
      throw new Error(`Failed to fetch expired medicines: ${response.statusText}`);
    }
    const data: MedicineResponse[] = await response.json();
    return data.map(toMedicine);
  },

  // Get low stock medicines
  async getLowStock(threshold: number = 10): Promise<Medicine[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/low-stock?threshold=${threshold}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch low stock medicines: ${response.statusText}`);
    }
    const data: MedicineResponse[] = await response.json();
    return data.map(toMedicine);
  },
};

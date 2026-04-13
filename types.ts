
export type Theme = 'dark' | 'light';
export type UnitType = 'solid' | 'liquid';

export interface Rate {
  weight: number; // in grams or ml
  price: number;  // in rupees
}

export interface CartItem {
  id: string;
  name: string;
  weight: string;
  unit: string;
  price: number;
  type: UnitType;
}

export interface DairySeller {
  id: string;
  name: string;
  milkPrice: number;
  waterPrice: number;
  isDefault: boolean;
  sellerType?: 'milk' | 'water' | 'both';
}

export interface DairyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  milkQty: number; // in Liters
  milkPrice: number;
  waterQty: number; // in Jars
  waterPrice: number;
  sellerId?: string; // Legacy
  milkSellerId?: string;
  waterSellerId?: string;
  notes?: string;
}

export interface DairyPayment {
  id: string;
  sellerId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  timestamp: number;
  items: CartItem[];
  totalPrice: number;
}

// Utility function moved here to avoid circular dependencies between App and Calculator
export const getSafeId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

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

export interface PurchaseOrder {
  id: string;
  timestamp: number;
  items: CartItem[];
  totalPrice: number;
}

export const getSafeId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

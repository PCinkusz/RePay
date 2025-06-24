export interface Payment {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  merchant: string;
  price: number;
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface PaymentFormData {
  merchant: string;
  price: string; // String for form input, converted to number
  notes?: string;
}

export interface PaymentFilters {
  searchQuery: string;
  sortBy: 'date' | 'merchant' | 'price';
  sortOrder: 'asc' | 'desc';
}

export interface HandedOverAmount {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

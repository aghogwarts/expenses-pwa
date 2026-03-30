export type PaymentMethod = "cash" | "debit" | "credit";

export type Category =
  | "food"
  | "transport"
  | "health"
  | "education"
  | "bills"
  | "home"
  | "misc";

export interface Wallet {
  id: number;
  name: string;
  type: PaymentMethod;
  created_at: string;
}

export interface FundingEvent {
  id: number;
  wallet_id: number;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  wallet_name: string;
  amount: number;
  description: string;
  category: Category;
  payment_method: PaymentMethod;
  date: string;
  created_at: string;
}

export interface Cycle {
  wallet_id: number;
  wallet_name: string;
  wallet_type: PaymentMethod;
  funding_event_id: number | null;
  funded_on: string | null;
  opening_amount: number;
  leftover_from_previous: number;
  total_available: number;
  total_spent: number;
  current_balance: number;
  transactions: Transaction[];
}

export interface DashboardData {
  month: string;
  total_spent: number;
  daily_average: number;
  by_category: { category: Category; total: number }[];
  wallet_balances: {
    wallet_id: number;
    name: string;
    type: PaymentMethod;
    balance: number;
  }[];
  recent_transactions: Transaction[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food & Dining",
  transport: "Transport & Fuel",
  health: "Health",
  education: "Education",
  bills: "Bills & Utilities",
  home: "Home",
  misc: "Miscellaneous",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  food: "#4caf50",
  transport: "#66bb6a",
  health: "#81c784",
  education: "#a5d6a7",
  bills: "#2e7d32",
  home: "#388e3c",
  misc: "#1b5e20",
};

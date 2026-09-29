export type OrderStatus = "Pending" | "Validated" | "In Delivery" | "Paid";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  _creationTime?: number;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  categoryId: string;
  pricePerUnit: number;
  minOrderQuantity: number;
  stockQuantity: number;
  packageSize: string;
  _creationTime?: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPriceDA?: number;
}

export interface Order {
  _id: string;
  clientName: string;
  clientPhone?: string;
  wilaya?: string;
  status: OrderStatus;
  totalAmountDA: number;
  items: OrderItem[];
  notes?: string;
  createdAt?: number;
  _creationTime?: number;
}

export const ALGERIAN_WILAYAS = [
  "16 - Alger",
  "31 - Oran",
  "25 - Constantine",
  "19 - Sétif",
  "09 - Blida",
  "23 - Annaba",
  "13 - Tlemcen",
  "06 - Béjaïa",
  "15 - Tizi Ouzou",
  "35 - Boumerdès",
  "42 - Tipaza",
  "27 - Mostaganem",
  "05 - Batna",
  "14 - Tiaret",
  "30 - Ouargla",
  "47 - Ghardaïa",
  "07 - Biskra",
  "17 - Djelfa",
  "34 - Bordj Bou Arréridj",
  "22 - Sidi Bel Abbès",
];

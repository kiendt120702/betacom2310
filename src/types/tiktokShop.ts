export interface TiktokShop {
  id: string;
  name: string;
  status: string;
  type: 'Vận hành' | 'Booking';
  profile_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    email: string;
    manager_id?: string | null;
    manager?: {
      id: string;
      full_name: string | null;
      email: string;
    } | null;
  } | null;
}

export interface TiktokShopFormData {
  name: string;
  status: string;
  profile_id: string;
  type: 'Vận hành' | 'Booking';
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface User {
  id: string;
  full_name: string | null;
  email: string;
}
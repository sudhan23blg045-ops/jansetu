// Shared TypeScript Interfaces for Supabase Database Schema

export interface Scheme {
  id?: number;
  scheme_name: string;
  description: string | null;
  eligibility: string | null;
  benefits: string | null;
  category: string | null;
  state: string | null;
  official_link: string | null;
  last_date: string | null;
  status: string;
  created_at?: string;
}

export interface Ngo {
  id?: number;
  ngo_name: string;
  description: string | null;
  services: string | null;
  district: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  status: string;
  created_at?: string;
}

export interface LivelihoodOpportunity {
  id?: number;
  title: string;
  category: string | null;
  description: string | null;
  provider: string | null;
  location: string | null;
  eligibility: string | null;
  duration: string | null;
  contact: string | null;
  website: string | null;
  status: string;
  created_at?: string;
}

export interface NomadicCommunity {
  id?: number;
  community_name: string;
  status: string;
  created_at?: string;
  state?: string | null;
  category?: string | null;
  description?: string | null;
}

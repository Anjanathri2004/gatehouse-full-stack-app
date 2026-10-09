export type Role = 'General User' | 'Admin';
export type AccessLevel = 'public' | 'general' | 'admin';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  active: boolean;
  createdAt: string;
}

export interface UserForm {
  userId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  active: boolean;
  password?: string;
}

export interface RecordItem {
  id: number;
  title: string;
  category: string;
  owner: string;
  status: 'Open' | 'In review' | 'Closed';
  access: AccessLevel;
  updatedAt: string;
}

export interface RecordsResponse {
  items: RecordItem[];
  visible: number;
  total: number;
  accessLevels: AccessLevel[];
}

export interface LoginRequest { userId: string; password: string; role: Role; }
export interface LoginResponse { token: string; user: User; }

/** State of one independently loading section of a page. */
export interface Section<T> { loading: boolean; data?: T; error?: string; ms?: number; }

export interface Student {
  id: string;
  name: string;
  department: string;
  gender: 'Male' | 'Female' | 'Other';
  age: string;
  dob: string;
  email: string;
  timestamp: string; // ISO string
}

export interface User {
  username: string;
  role: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

export enum Department {
  CS = 'Computer Science',
  ENG = 'Engineering',
  ARTS = 'Arts & Humanities',
  SCI = 'Sciences',
  BUS = 'Business'
}

export interface AttendanceStats {
  total: number;
  byDept: { name: string; value: number }[];
  byGender: { name: string; value: number }[];
}
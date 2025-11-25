import { Department, Student } from './types';

export const DEPARTMENTS = Object.values(Department);

export const MOCK_ADMIN_CREDS = {
  username: 'admin',
  password: '105619'
};

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbx0qUvj1fBYVyhLlGPuwRC_tUpE3n8Fhks4mTyTvk8JTP98CqvvMioDXjqHVX5yPN5o/exec';

export const INITIAL_STUDENTS: Student[] = [
  { 
    id: 'S001', 
    name: 'Alice Johnson', 
    department: 'Computer Science', 
    gender: 'Female', 
    age: '20',
    dob: '2004-05-15',
    email: 'alice@example.com',
    timestamp: new Date(Date.now() - 86400000).toISOString() 
  },
  { 
    id: 'S002', 
    name: 'Bob Smith', 
    department: 'Engineering', 
    gender: 'Male', 
    age: '21',
    dob: '2003-08-22',
    email: 'bob@example.com',
    timestamp: new Date(Date.now() - 43200000).toISOString() 
  },
  { 
    id: 'S003', 
    name: 'Charlie Brown', 
    department: 'Arts & Humanities', 
    gender: 'Male', 
    age: '22',
    dob: '2002-11-30',
    email: 'charlie@example.com',
    timestamp: new Date().toISOString() 
  },
];
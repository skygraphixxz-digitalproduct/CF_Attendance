import { Department, Student } from './types';

export const DEPARTMENTS = Object.values(Department);

export const MOCK_ADMIN_CREDS = {
  username: 'admin',
  password: '105619'
};

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwXyI3zhybX5gd_CjE7DIy19iiT_6Ls-hbxIjT3IXQRvllqehuejJsI4T5gSsVfhUJA/exec';

// Cebu Institute of Technology - University
// https://maps.app.goo.gl/GpFHQVsw3L7xzCQJ6?g_st=ipc
export const TARGET_LOCATION = {
  lat: 10.295777,
  lng: 123.880447,
  radiusMeters: 500 // Allowed radius in meters
};

export const INITIAL_STUDENTS: Student[] = [
  { 
    id: 'S001', 
    name: 'Alice Johnson', 
    department: 'BSIT', 
    gender: 'Female', 
    age: '20',
    dob: '2004-05-15',
    email: 'alice@example.com',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    attendanceStatus: 'Present'
  },
  { 
    id: 'S002', 
    name: 'Bob Smith', 
    department: 'BSHM', 
    gender: 'Male', 
    age: '21',
    dob: '2003-08-22',
    email: 'bob@example.com',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    attendanceStatus: 'Present'
  },
  { 
    id: 'S003', 
    name: 'Charlie Brown', 
    department: 'BSBA', 
    gender: 'Male', 
    age: '22',
    dob: '2002-11-30',
    email: 'charlie@example.com',
    timestamp: new Date().toISOString(),
    attendanceStatus: 'Absent' 
  },
];
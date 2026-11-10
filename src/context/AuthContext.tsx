import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOrCreateDeviceToken, type DeviceInfo } from '../services/deviceFingerprint';
import type { Student } from '../types';

interface AuthContextType {
  student: Student | null;
  deviceInfo: DeviceInfo;
  isLoggedIn: boolean;
  loginStudent: (studentData: Partial<Student>) => void;
  logout: () => void;
  refreshDevice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STUDENT_STORAGE_KEY = 'bca_logged_in_student';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(() => {
    try {
      const stored = localStorage.getItem(STUDENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getOrCreateDeviceToken());

  useEffect(() => {
    // Keep device token refreshed
    setDeviceInfo(getOrCreateDeviceToken());
  }, []);

  const loginStudent = (data: Partial<Student>) => {
    const updated: Student = {
      id: data.id || `std-${Date.now()}`,
      email: data.email || 'student@example.com',
      fullName: data.fullName || 'BCA Scholar',
      mobile: data.mobile || '',
      collegeName: data.collegeName,
      studentId: data.studentId,
      registeredAt: data.registeredAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    setStudent(updated);
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(updated));
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem(STUDENT_STORAGE_KEY);
  };

  const refreshDevice = () => {
    setDeviceInfo(getOrCreateDeviceToken());
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        deviceInfo,
        isLoggedIn: Boolean(student),
        loginStudent,
        logout,
        refreshDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

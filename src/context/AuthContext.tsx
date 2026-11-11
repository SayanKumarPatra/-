import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOrCreateDeviceToken, type DeviceInfo } from '../services/deviceFingerprint';
import type { Student } from '../types';
import {
  auth,
  syncStudentProfileRealtime,
  syncActiveDeviceRealtime,
  releaseActiveDeviceRealtime,
} from '../firebase/firebase';
import { api } from '../services/api';
import { onAuthStateChanged } from 'firebase/auth';

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

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Only enrich student if an authorized session is active in local storage
        const stored = localStorage.getItem(STUDENT_STORAGE_KEY);
        if (!stored) return;

        setStudent((prev) => {
          if (!prev) return null;
          if (prev.id === firebaseUser.uid && prev.email === (firebaseUser.email || prev.email)) return prev;
          const userStudent: Student = {
            ...prev,
            id: firebaseUser.uid || prev.id,
            email: firebaseUser.email || prev.email,
            fullName: firebaseUser.displayName || prev.fullName,
            lastLoginAt: new Date().toISOString(),
          };
          localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(userStudent));
          // Real-time sync to Firestore / RTDB
          syncStudentProfileRealtime(userStudent);
          return userStudent;
        });
      }
    });

    return () => {
      unsubscribeAuth();
    };
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

    // Real-time sync to Firebase Realtime Database
    syncStudentProfileRealtime(updated).catch((err) => {
      console.warn('Realtime Firebase sync note:', err);
    });

    // Real-time active device registration
    syncActiveDeviceRealtime(updated.id, {
      token: deviceInfo.token,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      userAgent: deviceInfo.userAgent,
    }).catch(() => {});
  };

  const logout = () => {
    const studentToLogout = student;
    setStudent(null);
    localStorage.removeItem(STUDENT_STORAGE_KEY);
    auth.signOut().catch(() => {});

    if (studentToLogout?.id) {
      // Release server-side and realtime active device session so another device can log in!
      api.studentLogout(studentToLogout.id).catch(() => {});
      releaseActiveDeviceRealtime(studentToLogout.id).catch(() => {});
    }
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

import React, { createContext, useState, useEffect, ReactNode } from 'react';

// This is the correct, complete definition of our User
interface User {
  _id: string;
  mallId?: string; // Optional because companies have companyId
  companyId?: string;
  role: 'admin' | 'company' | 'super-admin';
  token: string;
  imageUrl?: string;
  mallName?: string;
  brandName?: string;
  location?: string;
  email?: string;
  mobileNumber?: string;
}

interface AuthContextType {
  user: User | null;
  originalUser: User | null; // Added for impersonation
  login: (userData: User) => void;
  impersonate: (targetUser: User) => void;
  stopImpersonating: () => void;
  logout: () => void;
  isLoading: boolean; // The 'patient guard' needs this
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true


  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('smartcartUser');
      const storedOriginalUser = localStorage.getItem('smartcartOriginalUser'); // Check for ongoing impersonation
      if (storedUser) {
        // If we find a user, set them as the logged-in user
        setUser(JSON.parse(storedUser));
      }
      if (storedOriginalUser) {
        setOriginalUser(JSON.parse(storedOriginalUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // If storage is corrupt, clear it
      localStorage.removeItem('smartcartUser');
      localStorage.removeItem('smartcartOriginalUser');
    } finally {
      // CRITICAL: We only set isLoading to false AFTER we have
      // finished checking localStorage.
      setIsLoading(false);
    }


  const login = (userData: User) => {
    setUser(userData);
    setOriginalUser(null); // Clear any impersonation on fresh login
    localStorage.setItem('smartcartUser', JSON.stringify(userData));
    localStorage.removeItem('smartcartOriginalUser');
  };

  const impersonate = (targetUser: User) => {
      // If we are already impersonating, keep the original originalUser
      if (!originalUser && user) {
          setOriginalUser(user);
          localStorage.setItem('smartcartOriginalUser', JSON.stringify(user));
      }
      setUser(targetUser);
      localStorage.setItem('smartcartUser', JSON.stringify(targetUser));
  };

  const stopImpersonating = () => {
      if (originalUser) {
          setUser(originalUser);
          localStorage.setItem('smartcartUser', JSON.stringify(originalUser));
          setOriginalUser(null);
          localStorage.removeItem('smartcartOriginalUser');
      }
  };

  const logout = () => {
    setUser(null);
    setOriginalUser(null);
    localStorage.removeItem('smartcartUser');
    localStorage.removeItem('smartcartOriginalUser');
  };

  return (
    <AuthContext.Provider value={{ user, originalUser, login, impersonate, stopImpersonating, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

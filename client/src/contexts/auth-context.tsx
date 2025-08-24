import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuthStatus = async () => {
    try {
      const response = await fetch("/auth/me");
      if (response.ok) {
        const data = await response.json();
        console.log("Auth context - Fetched user data:", data);
        setUser(data.user);
        setIsAuthenticated(data.isAuthenticated);
      } else {
        console.log("Auth context - Not authenticated");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error fetching auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch("/auth/logout", { method: "POST" });
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await fetchAuthStatus();
  };

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

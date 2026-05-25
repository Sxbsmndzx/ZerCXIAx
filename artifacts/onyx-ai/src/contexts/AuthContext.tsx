import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, SettingsInputTheme } from "@workspace/api-client-react";
import { useGetCurrentUser, useUpdateSettings, useGetSettings } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("onyx_token"));
  const { data: user, isLoading, refetch } = useGetCurrentUser({
    query: {
      enabled: !!token,
      queryKey: ["/api/auth/me"]
    }
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("onyx_token", newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem("onyx_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { User } from "@workspace/api-client-react";
import { useGetCurrentUser, setAuthTokenGetter } from "@workspace/api-client-react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    // Set token getter once — always reads the latest session from Supabase
    setAuthTokenGetter(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    });

    // onAuthStateChange fires immediately with INITIAL_SESSION, so we don't
    // need a separate getSession() call. Using only one source of truth avoids
    // the race where getSession() resolves (session=null, loading=false) a few
    // ms before the listener fires with the real session, which caused the
    // auth guard to briefly see user=null and redirect back to login.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: user, isLoading: userLoading, refetch } = useGetCurrentUser({
    query: {
      enabled: !!session,
      queryKey: ["/api/auth/me", session?.user?.id],
    },
  });

  const login = (_token: string, _user: User, _rememberMe?: boolean) => {
    refetch();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const updateUser = (_user: User) => {
    refetch();
  };

  const isLoading = sessionLoading || (!!session && userLoading);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

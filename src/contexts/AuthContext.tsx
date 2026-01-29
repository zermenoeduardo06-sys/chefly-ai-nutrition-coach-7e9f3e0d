import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  
  // Track previous userId to detect account changes
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Set up auth listener BEFORE checking session (critical for proper auth flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        const newUserId = currentSession?.user?.id ?? null;
        
        // Clear cache if user changed (not just on logout)
        if (previousUserIdRef.current && previousUserIdRef.current !== newUserId) {
          queryClient.clear();
        }
        
        previousUserIdRef.current = newUserId;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        // Clear all cached data on logout
        if (event === "SIGNED_OUT") {
          queryClient.clear();
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      const existingUserId = existingSession?.user?.id ?? null;
      previousUserIdRef.current = existingUserId;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const signOut = useCallback(async () => {
    queryClient.clear();
    await supabase.auth.signOut();
  }, [queryClient]);

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

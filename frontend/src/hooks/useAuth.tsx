import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { login, register } from "@/api";   // ✅ new API

interface Profile {
  id: string;
  name: string;
  email: string;
  role: "employee" | "lead";
  skills?: string[];
  status?: "available" | "busy";
  weekly_capacity_hours?: number;
  notification_prefs?: {
    email: boolean;
    inApp: boolean;
  };
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { name: string; role: "employee" | "lead" }) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Restore profile from localStorage if token exists
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setProfile(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setProfile(data.user);

      toast({ title: "Welcome back!", description: "Login successful." });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role: "employee" | "lead" }) => {
    try {
      await register({ email, password, username: userData.name });
      toast({ title: "Account created!", description: "Please login to continue." });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfile(null);
    toast({ title: "Signed out", description: "You have been logged out." });
  };

  const value: AuthContextType = {
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

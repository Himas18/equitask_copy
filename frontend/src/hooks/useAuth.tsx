import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "@/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (username: string, email: string, password: string, role?: string) => Promise<{ error?: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await login({ email, password });

      localStorage.setItem("token", res.data.token);
      setProfile(res.data.user);

      toast({
        title: "Welcome back",
        description: "Successfully logged into EquiTask",
      });

      navigate("/app");
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string, role?: string) => {
    setLoading(true);
    try {
      await register({ username, email, password, role });

      toast({
        title: "Account created",
        description: "You can now log in to EquiTask",
      });

      navigate("/login");
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setProfile(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

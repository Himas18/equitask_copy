import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, me, apiClient } from "@/api"; // ⬅️ ensure you export a configured axios instance (apiClient)
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  role: "employee" | "lead";
}

interface AuthContextType {
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (
    username: string,
    email: string,
    password: string,
    role: "employee" | "lead"
  ) => Promise<{ error?: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Helper to set/unset the Authorization header on your axios/fetch wrapper
function setAuthToken(token: string | null) {
  if (apiClient && (apiClient as any).defaults) {
    if (token) {
      (apiClient as any).defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete (apiClient as any).defaults.headers.common["Authorization"];
    }
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ⬅️ start true so ProtectedRoute can wait
  const { toast } = useToast();
  const navigate = useNavigate();

  // 🔹 Bootstrap auth on first mount
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setProfile(null);
          return;
        }

        setAuthToken(token);

        // OPTION A: If your backend has /me, prefer fetching fresh user:
        // (Make sure you export a `me()` call from @/api that hits something like GET /auth/me)
        try {
          const resp = await me();
          setProfile(resp.data.user as User);
        } catch {
          // If /me fails (expired/invalid token), clean up
          localStorage.removeItem("token");
          setAuthToken(null);
          setProfile(null);
        }

        // OPTION B (fallback): If you don't have /me, restore cached user:
        // const cached = localStorage.getItem("user");
        // if (cached) setProfile(JSON.parse(cached) as User);

      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 🔹 Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await login({ email, password });

      const token: string = res.data.token;
      const user: User = res.data.user;

      // persist + wire token for subsequent requests
      localStorage.setItem("token", token);
      setAuthToken(token);

      // set user in state (and optionally cache)
      setProfile(user);
      // localStorage.setItem("user", JSON.stringify(user)); // uncomment if you don’t have /me

      toast({
        title: "Welcome back",
        description: "Successfully logged into EquiTask",
      });

      navigate("/app/dashboard");
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Sign Up
  const signUp = async (
    username: string,
    email: string,
    password: string,
    role: "employee" | "lead"
  ) => {
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
        description: err?.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Sign Out
  const signOut = () => {
    localStorage.removeItem("token");
    // localStorage.removeItem("user"); // if you enabled user caching
    setAuthToken(null);
    setProfile(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

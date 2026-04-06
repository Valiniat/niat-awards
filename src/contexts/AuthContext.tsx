import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  phone: string;
  role: "student" | "teacher" | "admin";
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  setUserRole: (role: User["role"]) => void;
  setUserName: (name: string) => void;
  logout: () => void;
  pendingPhone: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const MASTER_OTP = "000000";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("niat_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    if (user) localStorage.setItem("niat_user", JSON.stringify(user));
    else localStorage.removeItem("niat_user");
  }, [user]);

  const sendOtp = async (phone: string): Promise<boolean> => {
    // Simulate OTP send
    setPendingPhone(phone);
    return true;
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    if (otp === MASTER_OTP && pendingPhone) {
      setUser({ phone: pendingPhone, role: "student" });
      setPendingPhone(null);
      return true;
    }
    return false;
  };

  const setUserRole = (role: User["role"]) => {
    if (user) setUser({ ...user, role });
  };

  const setUserName = (name: string) => {
    if (user) setUser({ ...user, name });
  };

  const logout = () => {
    setUser(null);
    setPendingPhone(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, sendOtp, verifyOtp, setUserRole, setUserName, logout, pendingPhone }}>
      {children}
    </AuthContext.Provider>
  );
};

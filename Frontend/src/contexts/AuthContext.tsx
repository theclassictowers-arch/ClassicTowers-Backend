import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

// Add this type definition
declare global {
  interface Window {
    setAuthRole?: (role: string | null) => void;
  }
}

interface AuthContextType {
  role: string | null;
  setRole: (role: string | null) => void;
  isAuthenticated: boolean;
  login: (newRole: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within a ContextProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRoleState] = useState<string | null>(() =>
    localStorage.getItem("role")
  );

  const setRole = useCallback((newRole: string | null) => {
    setRoleState(newRole);
    newRole
      ? localStorage.setItem("role", newRole)
      : localStorage.removeItem("role");
  }, []);

  // Make setRole available globally
  useEffect(() => {
    window.setAuthRole = setRole;
    return () => {
      delete window.setAuthRole;
    };
  }, [setRole]);

  const login = useCallback((newRole: string) => setRole(newRole), [setRole]);
  const logout = useCallback(() => setRole(null), [setRole]);

  const value = useMemo(
    () => ({
      role,
      setRole,
      isAuthenticated: !!role,
      login,
      logout,
    }),
    [role, setRole, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

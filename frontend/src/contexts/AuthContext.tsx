import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  loginAndGetToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const getToken = useCallback(async () => {
    return user ? user.getIdToken() : null;
  }, [user]);

  const loginAndGetToken = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user.getIdToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, getToken, loginAndGetToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

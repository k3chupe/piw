"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../_lib/firebase";
import { formatAuthError } from "../_lib/firebaseErrors";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error("useAuth musi być użyty wewnątrz AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setError(formatAuthError(e));
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signInGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      const msg = formatAuthError(e);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const signInEmail = useCallback(async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const msg = formatAuthError(e);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const signUp = useCallback(async (email, password) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const msg = formatAuthError(e);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      clearError,
      signInGoogle,
      signInEmail,
      signUp,
      signOut,
    }),
    [user, loading, error, clearError, signInGoogle, signInEmail, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;

"use client";

import { AuthProvider } from "./_contexts/AuthContext";
import { GamesProvider } from "./_contexts/GamesContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <GamesProvider>{children}</GamesProvider>
    </AuthProvider>
  );
}

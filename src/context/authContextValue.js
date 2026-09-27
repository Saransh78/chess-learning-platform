import { createContext } from "react";

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  error: "",
  isConfigured: false,
  signInWithGoogle: async () => null,
  signOut: async () => {},
});

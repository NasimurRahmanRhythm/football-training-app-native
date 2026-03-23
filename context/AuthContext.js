import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});
const AUTH_STORAGE_KEY = "user_session";
const EXPIRY_DAYS = 15;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derive isLoggedIn from the presence of user
  const isLoggedIn = !!user;

  // Check for existing session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (sessionData) {
          const { user, loginTimestamp } = JSON.parse(sessionData);

          // Check if session has expired (15 days)
          const now = new Date().getTime();
          const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

          if (now - loginTimestamp > expiryTime) {
            // Session expired
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            setUser(null);
          } else {
            // Session valid
            setUser(user);
          }
        }
      } catch (error) {
        console.error("Failed to load auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (userData) => {
    try {
      const sessionData = {
        user: userData,
        loginTimestamp: new Date().getTime(),
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      setUser(userData);
    } catch (error) {
      console.error("Failed to save auth session:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Failed to clear auth session:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, login, logout, setUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

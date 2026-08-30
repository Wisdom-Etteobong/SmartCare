import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { IUser, LoginDTO, RegisterDTO, UpdateProfileDTO, VerifyOtpDTO } from '../../../package/src/types/user';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utils/secureStorage';

export interface LoginResult {
  requireOtp?: boolean;
  tempToken?: string;
  otpSentTo?: string;
  demoOtp?: string;
  mustChangePassword?: boolean;
  user?: IUser;
}

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePasswordModalOpen: boolean;
  setMustChangePasswordModalOpen: (open: boolean) => void;
  login: (credentials: LoginDTO) => Promise<LoginResult>;
  verifyOtp: (data: VerifyOtpDTO) => Promise<{ user: IUser; mustChangePassword: boolean }>;
  changeFirstPassword: (newPassword: string) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileDTO) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User profile information is securely maintained in memory only (never written to web storage)
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mustChangePasswordModalOpen, setMustChangePasswordModalOpen] = useState<boolean>(false);

  const refreshUser = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.data?.user) {
        const currentUser = res.data.data.user;
        setUser(currentUser);
        setToken(storedToken);
        if (currentUser.mustChangePassword) {
          setMustChangePasswordModalOpen(true);
        }
      }
    } catch {
      removeAuthToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginDTO): Promise<LoginResult> => {
    const res = await api.post('/auth/login', credentials);
    const data = res.data.data;

    if (data.requireOtp) {
      return {
        requireOtp: true,
        tempToken: data.tempToken,
        otpSentTo: data.otpSentTo,
        demoOtp: data.demoOtp,
      };
    }

    const { user: loggedInUser, token: authToken, mustChangePassword } = data;
    setUser(loggedInUser);
    setToken(authToken);
    setAuthToken(authToken);

    if (mustChangePassword || loggedInUser?.mustChangePassword) {
      setMustChangePasswordModalOpen(true);
    }

    return {
      requireOtp: false,
      user: loggedInUser,
      mustChangePassword: !!mustChangePassword,
    };
  };

  const verifyOtp = async (data: VerifyOtpDTO): Promise<{ user: IUser; mustChangePassword: boolean }> => {
    const res = await api.post('/auth/verify-otp', data);
    const { user: verifiedUser, token: authToken, mustChangePassword } = res.data.data;

    setUser(verifiedUser);
    setToken(authToken);
    setAuthToken(authToken);

    if (mustChangePassword || verifiedUser?.mustChangePassword) {
      setMustChangePasswordModalOpen(true);
    }

    return {
      user: verifiedUser,
      mustChangePassword: !!mustChangePassword,
    };
  };

  const changeFirstPassword = async (newPassword: string): Promise<void> => {
    const res = await api.post('/auth/change-first-password', { newPassword });
    const updatedUser = res.data.data.user;
    setUser(updatedUser);
    setMustChangePasswordModalOpen(false);
  };

  const register = async (data: RegisterDTO) => {
    const res = await api.post('/auth/register', data);
    const { user: registeredUser, token: authToken } = res.data.data;
    setUser(registeredUser);
    setToken(authToken);
    setAuthToken(authToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      removeAuthToken();
      setUser(null);
      setToken(null);
      setMustChangePasswordModalOpen(false);
    }
  };

  const updateProfile = async (data: UpdateProfileDTO) => {
    const res = await api.patch('/auth/profile', data);
    const updatedUser = res.data.data.user;
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        mustChangePasswordModalOpen,
        setMustChangePasswordModalOpen,
        login,
        verifyOtp,
        changeFirstPassword,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

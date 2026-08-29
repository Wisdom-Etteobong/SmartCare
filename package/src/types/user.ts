export type UserRole = 'patient' | 'doctor' | 'admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  doctorId?: string;
  doctorProfile?: any;
  phone?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string | {
    name: string;
    relationship: string;
    phone: string;
  };
  department?: string;
  mustChangePassword?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: IUser;
    token?: string;
    requireOtp?: boolean;
    tempToken?: string;
    otpSentTo?: string;
    demoOtp?: string; // Preview display code for testing
    mustChangePassword?: boolean;
  };
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface VerifyOtpDTO {
  tempToken: string;
  otp: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email?: string;
  resetToken?: string;
  otp: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    maskedEmail: string;
    resetToken: string;
    demoOtp?: string;
    expiresInMinutes: number;
  };
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  department?: string;
  isActive?: boolean;
  emergencyContact?: string | {
    name: string;
    relationship: string;
    phone: string;
  };
}


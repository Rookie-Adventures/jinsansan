import { AUTH_CONSTANTS } from '../constants/auth';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  role: keyof typeof AUTH_CONSTANTS.ROLES;
  permissions: Array<keyof typeof AUTH_CONSTANTS.PERMISSIONS>;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
  };
}

export interface UserSettings {
  id: string;
  userId: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'profile_update' | 'settings_update' | 'password_change';
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  device: string;
  ip: string;
  lastActive: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserStats {
  totalLogins: number;
  lastLogin: string;
  totalSessions: number;
  activeSessions: number;
  totalNotifications: number;
  unreadNotifications: number;
} 
import { AUTH_CONSTANTS } from '../constants/auth';
import { createValidationError } from './error';

export const validateUsername = (username: string) => {
  if (!username) {
    return createValidationError('username', username, 'Username is required');
  }

  if (username.length < AUTH_CONSTANTS.USER.MIN_USERNAME_LENGTH) {
    return createValidationError(
      'username',
      username,
      `Username must be at least ${AUTH_CONSTANTS.USER.MIN_USERNAME_LENGTH} characters long`
    );
  }

  if (username.length > AUTH_CONSTANTS.USER.MAX_USERNAME_LENGTH) {
    return createValidationError(
      'username',
      username,
      `Username must not exceed ${AUTH_CONSTANTS.USER.MAX_USERNAME_LENGTH} characters`
    );
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return createValidationError(
      'username',
      username,
      'Username can only contain letters, numbers, underscores, and hyphens'
    );
  }

  return null;
};

export const validateEmail = (email: string) => {
  if (!email) {
    return createValidationError('email', email, 'Email is required');
  }

  if (email.length < AUTH_CONSTANTS.USER.MIN_EMAIL_LENGTH) {
    return createValidationError(
      'email',
      email,
      `Email must be at least ${AUTH_CONSTANTS.USER.MIN_EMAIL_LENGTH} characters long`
    );
  }

  if (email.length > AUTH_CONSTANTS.USER.MAX_EMAIL_LENGTH) {
    return createValidationError(
      'email',
      email,
      `Email must not exceed ${AUTH_CONSTANTS.USER.MAX_EMAIL_LENGTH} characters`
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return createValidationError('email', email, 'Invalid email format');
  }

  return null;
};

export const validatePassword = (password: string) => {
  if (!password) {
    return createValidationError('password', password, 'Password is required');
  }

  if (password.length < AUTH_CONSTANTS.PASSWORD.MIN_LENGTH) {
    return createValidationError(
      'password',
      password,
      `Password must be at least ${AUTH_CONSTANTS.PASSWORD.MIN_LENGTH} characters long`
    );
  }

  if (password.length > AUTH_CONSTANTS.PASSWORD.MAX_LENGTH) {
    return createValidationError(
      'password',
      password,
      `Password must not exceed ${AUTH_CONSTANTS.PASSWORD.MAX_LENGTH} characters`
    );
  }

  if (!/[A-Z]/.test(password)) {
    return createValidationError(
      'password',
      password,
      'Password must contain at least one uppercase letter'
    );
  }

  if (!/[a-z]/.test(password)) {
    return createValidationError(
      'password',
      password,
      'Password must contain at least one lowercase letter'
    );
  }

  if (!/\d/.test(password)) {
    return createValidationError(
      'password',
      password,
      'Password must contain at least one number'
    );
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return createValidationError(
      'password',
      password,
      'Password must contain at least one special character'
    );
  }

  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) {
    return createValidationError('confirmPassword', confirmPassword, 'Please confirm your password');
  }

  if (password !== confirmPassword) {
    return createValidationError(
      'confirmPassword',
      confirmPassword,
      'Passwords do not match'
    );
  }

  return null;
};

export const validatePhone = (phone: string) => {
  if (!phone) {
    return createValidationError('phone', phone, 'Phone number is required');
  }

  if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
    return createValidationError('phone', phone, 'Invalid phone number format');
  }

  return null;
};

export const validateUrl = (url: string) => {
  if (!url) {
    return createValidationError('url', url, 'URL is required');
  }

  try {
    new URL(url);
    return null;
  } catch {
    return createValidationError('url', url, 'Invalid URL format');
  }
};

export const validateDate = (date: string) => {
  if (!date) {
    return createValidationError('date', date, 'Date is required');
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return createValidationError('date', date, 'Invalid date format');
  }

  return null;
};

export const validateNumber = (number: number, min?: number, max?: number) => {
  if (typeof number !== 'number') {
    return createValidationError('number', number, 'Value must be a number');
  }

  if (min !== undefined && number < min) {
    return createValidationError('number', number, `Value must be at least ${min}`);
  }

  if (max !== undefined && number > max) {
    return createValidationError('number', number, `Value must not exceed ${max}`);
  }

  return null;
};

export const validateArray = (array: any[], minLength?: number, maxLength?: number) => {
  if (!Array.isArray(array)) {
    return createValidationError('array', array, 'Value must be an array');
  }

  if (minLength !== undefined && array.length < minLength) {
    return createValidationError(
      'array',
      array,
      `Array must contain at least ${minLength} items`
    );
  }

  if (maxLength !== undefined && array.length > maxLength) {
    return createValidationError(
      'array',
      array,
      `Array must not contain more than ${maxLength} items`
    );
  }

  return null;
}; 
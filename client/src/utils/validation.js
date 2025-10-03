// Form Validation Utilities

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  return { isValid: true, message: "Password is strong" };
};

/**
 * Validate phone number (Indian format)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate price (must be positive number)
 */
export const validatePrice = (price) => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0;
};

/**
 * Validate text input (no special characters for names)
 */
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name);
};

/**
 * Sanitize text input (remove potential XSS)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate file upload
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = options;

  if (!file) {
    return { isValid: false, message: "No file selected" };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: `File type must be ${allowedTypes.join(', ')}` 
    };
  }

  return { isValid: true, message: "File is valid" };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Validate number range
 */
export const validateRange = (value, min, max, fieldName = 'Value') => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a number` };
  }
  
  if (num < min || num > max) {
    return { 
      isValid: false, 
      message: `${fieldName} must be between ${min} and ${max}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Comprehensive form validator
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const result = validator(formData[field]);
      if (!result.isValid) {
        errors[field] = result.message;
        break; // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

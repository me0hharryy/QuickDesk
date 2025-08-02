export const validationRules = {
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  minLength: (value, minLength, fieldName = 'Field') => {
    if (!value) return null;
    return value.length >= minLength ? null : `${fieldName} must be at least ${minLength} characters`;
  },

  maxLength: (value, maxLength, fieldName = 'Field') => {
    if (!value) return null;
    return value.length <= maxLength ? null : `${fieldName} must not exceed ${maxLength} characters`;
  },

  password: (value) => {
    if (!value) return null;
    const errors = [];
    
    if (value.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(value)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors.length > 0 ? errors.join(', ') : null;
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    return password === confirmPassword ? null : 'Passwords do not match';
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number';
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  number: (value, fieldName = 'Field') => {
    if (!value) return null;
    return !isNaN(value) && !isNaN(parseFloat(value)) ? null : `${fieldName} must be a valid number`;
  },

  integer: (value, fieldName = 'Field') => {
    if (!value) return null;
    return Number.isInteger(Number(value)) ? null : `${fieldName} must be a whole number`;
  },

  min: (value, min, fieldName = 'Field') => {
    if (!value) return null;
    return Number(value) >= min ? null : `${fieldName} must be at least ${min}`;
  },

  max: (value, max, fieldName = 'Field') => {
    if (!value) return null;
    return Number(value) <= max ? null : `${fieldName} must not exceed ${max}`;
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? null : 'Please enter a valid date';
  },

  futureDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    return date > now ? null : 'Date must be in the future';
  },

  pastDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    return date < now ? null : 'Date must be in the past';
  },
};

export const validateField = (value, rules, fieldName) => {
  if (!Array.isArray(rules)) {
    rules = [rules];
  }

  for (const rule of rules) {
    if (typeof rule === 'string') {
      // Simple rule name
      const error = validationRules[rule]?.(value, fieldName);
      if (error) return error;
    } else if (typeof rule === 'function') {
      // Custom validation function
      const error = rule(value, fieldName);
      if (error) return error;
    } else if (typeof rule === 'object') {
      // Rule with parameters
      const { type, ...params } = rule;
      const ruleFunction = validationRules[type];
      if (ruleFunction) {
        const error = ruleFunction(value, ...Object.values(params), fieldName);
        if (error) return error;
      }
    }
  }

  return null;
};

export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach(fieldName => {
    const rules = validationSchema[fieldName];
    const value = formData[fieldName];
    
    const error = validateField(value, rules, fieldName);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Common validation schemas
export const schemas = {
  login: {
    email: ['required', 'email'],
    password: ['required'],
  },

  register: {
    username: [
      'required',
      { type: 'minLength', minLength: 3 },
      { type: 'maxLength', maxLength: 30 }
    ],
    email: ['required', 'email'],
    password: ['required', 'password'],
    confirmPassword: ['required'],
  },

  profile: {
    'profile.firstName': [{ type: 'maxLength', maxLength: 50 }],
    'profile.lastName': [{ type: 'maxLength', maxLength: 50 }],
    'profile.phone': ['phone'],
    'profile.department': [{ type: 'maxLength', maxLength: 100 }],
  },

  ticket: {
    subject: [
      'required',
      { type: 'maxLength', maxLength: 200 }
    ],
    description: [
      'required',
      { type: 'maxLength', maxLength: 2000 }
    ],
    category: ['required'],
  },

  comment: {
    message: [
      'required',
      { type: 'maxLength', maxLength: 1000 }
    ],
  },

  category: {
    name: [
      'required',
      { type: 'maxLength', maxLength: 50 }
    ],
    description: [{ type: 'maxLength', maxLength: 200 }],
  },
};

export default {
  validationRules,
  validateField,
  validateForm,
  schemas,
};

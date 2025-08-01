/**
 * Input validation utilities for API routes
 * Centralizes validation logic to eliminate DRY violations
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: any;
}

/**
 * Validates and sanitizes text input
 */
export function validateText(
  value: any, 
  fieldName: string, 
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
  } = {}
): ValidationResult {
  const { required = false, minLength = 0, maxLength = 10000, allowEmpty = false } = options;

  if (value === null || value === undefined) {
    return {
      isValid: !required,
      error: required ? `${fieldName} is required` : undefined,
      sanitizedValue: ''
    };
  }

  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} must be a string`,
    };
  }

  const trimmed = value.trim();

  if (!allowEmpty && trimmed.length === 0 && required) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`,
    };
  }

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${maxLength} characters`,
    };
  }

  // Basic XSS prevention
  const sanitized = trimmed
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return {
    isValid: true,
    sanitizedValue: sanitized
  };
}

/**
 * Validates array input
 */
export function validateArray(
  value: any,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: any, index: number) => ValidationResult;
  } = {}
): ValidationResult {
  const { required = false, minLength = 0, maxLength = 100, itemValidator } = options;

  if (value === null || value === undefined) {
    return {
      isValid: !required,
      error: required ? `${fieldName} is required` : undefined,
      sanitizedValue: []
    };
  }

  if (!Array.isArray(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be an array`,
    };
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must have at least ${minLength} items`,
    };
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must have no more than ${maxLength} items`,
    };
  }

  // Validate each item if validator provided
  if (itemValidator) {
    for (let i = 0; i < value.length; i++) {
      const itemResult = itemValidator(value[i], i);
      if (!itemResult.isValid) {
        return {
          isValid: false,
          error: `${fieldName}[${i}]: ${itemResult.error}`,
        };
      }
    }
  }

  return {
    isValid: true,
    sanitizedValue: value
  };
}

/**
 * Validates object input
 */
export function validateObject(
  value: any,
  fieldName: string,
  requiredFields: string[] = [],
  optionalFields: string[] = []
): ValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: requiredFields.length === 0,
      error: requiredFields.length > 0 ? `${fieldName} is required` : undefined,
      sanitizedValue: {}
    };
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be an object`,
    };
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in value) || value[field] === null || value[field] === undefined) {
      return {
        isValid: false,
        error: `${fieldName} is missing required field: ${field}`,
      };
    }
  }

  // Check for unexpected fields
  const allowedFields = [...requiredFields, ...optionalFields];
  for (const field in value) {
    if (!allowedFields.includes(field)) {
      console.warn(`Unexpected field in ${fieldName}: ${field}`);
    }
  }

  return {
    isValid: true,
    sanitizedValue: value
  };
}

/**
 * Validates keyword input specifically
 */
export function validateKeyword(keyword: unknown): ValidationResult {
  return validateText(keyword, 'keyword', {
    required: true,
    minLength: 1,
    maxLength: 100
  });
}

/**
 * Validates blog content input
 */
export function validateBlogContent(content: any): ValidationResult {
  return validateText(content, 'blog content', {
    required: true,
    minLength: 10,
    maxLength: 50000
  });
}

/**
 * Validates visual description objects
 */
export function validateVisualDescription(desc: any, index: number): ValidationResult {
  const requiredFields = ["Image Name", "Caption Plan", "Target Audience", "Keywords", "Platform"];
  
  const objectResult = validateObject(desc, `description ${index + 1}`, requiredFields);
  if (!objectResult.isValid) {
    return objectResult;
  }

  // Additional validation for specific fields
  for (const field of requiredFields) {
    if (field === "Keywords") {
      // Keywords can be array or string
      const keywords = desc[field];
      if (!Array.isArray(keywords) && typeof keywords !== 'string') {
        return {
          isValid: false,
          error: `description ${index + 1}: Keywords must be an array or string`
        };
      }
    } else {
      const textResult = validateText(desc[field], `description ${index + 1}.${field}`, {
        required: true,
        minLength: 1,
        maxLength: 500
      });
      if (!textResult.isValid) {
        return textResult;
      }
    }
  }

  return { isValid: true, sanitizedValue: desc };
}
import { FILE_UPLOAD_CONFIG } from '../utils/constants';

export const uploadService = {
  validateFile: (file) => {
    const errors = [];

    // Check file size
    if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
      errors.push(`File ${file.name} is too large. Maximum size is ${FILE_UPLOAD_CONFIG.maxSize / 1024 / 1024}MB`);
    }

    // Check file type
    const allowedTypes = Object.keys(FILE_UPLOAD_CONFIG.acceptedTypes);
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop().toLowerCase();

    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''));
      }
      return type === fileType;
    });

    const isValidExtension = Object.values(FILE_UPLOAD_CONFIG.acceptedTypes)
      .flat()
      .some(ext => ext === `.${fileExtension}`);

    if (!isValidType && !isValidExtension) {
      errors.push(`File ${file.name} has an unsupported file type`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateFiles: (files) => {
    const allErrors = [];
    const validFiles = [];

    // Check number of files
    if (files.length > FILE_UPLOAD_CONFIG.maxFiles) {
      allErrors.push(`Too many files selected. Maximum is ${FILE_UPLOAD_CONFIG.maxFiles} files`);
      return {
        isValid: false,
        errors: allErrors,
        validFiles: [],
      };
    }

    files.forEach(file => {
      const validation = uploadService.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        allErrors.push(...validation.errors);
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      validFiles,
    };
  },

  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileIcon: (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      rar: '📦',
      default: '📎',
    };

    return iconMap[extension] || iconMap.default;
  },

  createFilePreview: (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  downloadFile: (filename, originalName) => {
    const link = document.createElement('a');
    link.href = `/uploads/${filename}`;
    link.download = originalName || filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default uploadService;

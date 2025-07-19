import types from '../config/types';

// Simple encryption functions for password security
const ENCRYPTION_KEY = 'diary-app-key-2024';

const simpleEncrypt = (text) => {
  try {
    return btoa(unescape(encodeURIComponent(text + ENCRYPTION_KEY)));
  } catch (e) {
    return text;
  }
};

const simpleDecrypt = (encrypted) => {
  try {
    const decrypted = decodeURIComponent(escape(atob(encrypted)));
    return decrypted.replace(ENCRYPTION_KEY, '');
  } catch (e) {
    return encrypted;
  }
};

// Date formatting utilities
const formatDateKey = (date) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const formatDisplayDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Diary localStorage operations
const diaryUtils = {
  // Password management
  setPassword: (password) => {
    const encrypted = simpleEncrypt(password);
    localStorage.setItem(types.DIARY_PASSWORD, encrypted);
  },

  checkPassword: (password) => {
    const stored = localStorage.getItem(types.DIARY_PASSWORD);
    if (!stored) return false;
    const decrypted = simpleDecrypt(stored);
    return password === decrypted;
  },

  hasPassword: () => {
    return Boolean(localStorage.getItem(types.DIARY_PASSWORD));
  },

  removePassword: () => {
    localStorage.removeItem(types.DIARY_PASSWORD);
    localStorage.removeItem(types.DIARY_AUTH_STATUS);
  },

  // Authentication status
  setAuthStatus: (isAuthenticated) => {
    sessionStorage.setItem(types.DIARY_AUTH_STATUS, isAuthenticated.toString());
  },

  getAuthStatus: () => {
    return sessionStorage.getItem(types.DIARY_AUTH_STATUS) === 'true';
  },

  clearAuthStatus: () => {
    sessionStorage.removeItem(types.DIARY_AUTH_STATUS);
  },

  // Diary entries management
  getDiaryEntries: () => {
    try {
      const entries = localStorage.getItem(types.DIARY_ENTRIES);
      return entries ? JSON.parse(entries) : {};
    } catch (e) {
      console.error('Error loading diary entries:', e);
      return {};
    }
  },

  saveDiaryEntry: (date, entryData) => {
    try {
      const entries = diaryUtils.getDiaryEntries();
      const dateKey = formatDateKey(date);
      
      entries[dateKey] = {
        ...entryData,
        date: dateKey,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(types.DIARY_ENTRIES, JSON.stringify(entries));
      return true;
    } catch (e) {
      console.error('Error saving diary entry:', e);
      return false;
    }
  },

  getDiaryEntry: (date) => {
    const entries = diaryUtils.getDiaryEntries();
    const dateKey = formatDateKey(date);
    return entries[dateKey] || null;
  },

  deleteDiaryEntry: (date) => {
    try {
      const entries = diaryUtils.getDiaryEntries();
      const dateKey = formatDateKey(date);
      delete entries[dateKey];
      localStorage.setItem(types.DIARY_ENTRIES, JSON.stringify(entries));
      return true;
    } catch (e) {
      console.error('Error deleting diary entry:', e);
      return false;
    }
  },

  getDatesWithEntries: () => {
    const entries = diaryUtils.getDiaryEntries();
    return Object.keys(entries);
  },

  getAllEntries: () => {
    return diaryUtils.getDiaryEntries();
  },

  exportDiary: () => {
    const entries = diaryUtils.getDiaryEntries();
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  // Search entries
  searchEntries: (searchTerm) => {
    const entries = diaryUtils.getDiaryEntries();
    const results = [];
    
    Object.entries(entries).forEach(([date, entry]) => {
      if (entry.content && entry.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ date, ...entry });
      }
    });
    
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};

// Export utilities
export {
  diaryUtils,
  formatDateKey,
  formatDisplayDate,
  formatTime,
  simpleEncrypt,
  simpleDecrypt
};

export default diaryUtils; 
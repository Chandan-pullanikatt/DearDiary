/**
 * Enhanced localStorage utility for notes app
 * Provides safe storage and retrieval of data with error handling
 */

function addtoLocalStorage(key, value) {
  try {
    if (typeof value === "object") {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

function getFromLocalStorage(key) {
  try {
    const value = localStorage.getItem(key);
    if (!value) {
      return null;
    }

    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // If JSON parsing fails, return as string
      return value;
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

function updateLocalStorage(key, updatedValue) {
  try {
    if (typeof updatedValue === "object") {
      localStorage.setItem(key, JSON.stringify(updatedValue));
    } else {
      localStorage.setItem(key, updatedValue);
    }
    return true;
  } catch (error) {
    console.error('Error updating localStorage:', error);
    return false;
  }
}

function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

// Notes-specific utility functions
function saveNotes(notes) {
  return addtoLocalStorage('notes-data', notes);
}

function loadNotes() {
  return getFromLocalStorage('notes-data') || [];
}

function clearAllData() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

// Check if localStorage is available
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const methods = {
  addtoLocalStorage,
  getFromLocalStorage,
  updateLocalStorage,
  removeFromLocalStorage,
  saveNotes,
  loadNotes,
  clearAllData,
  isLocalStorageAvailable
};

export default methods;
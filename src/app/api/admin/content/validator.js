// src/app/api/admin/content/validator.js
// Валидация структуры content.json

// Проверяем, что объект имеет правильную структуру профиля
function validateProfile(profile) {
  if (!profile || typeof profile !== 'object') return false;
  
  // Проверяем обязательные поля meta
  if (!profile.meta || typeof profile.meta !== 'object') return false;
  if (!profile.meta.company || typeof profile.meta.company !== 'string') return false;
  if (!profile.meta.timeline || typeof profile.meta.timeline !== 'string') return false;
  
  return true;
}

// Проверяем структуру GLOBAL_DATA
function validateGlobalData(globalData) {
  if (!globalData || typeof globalData !== 'object') return false;
  
  // Проверяем наличие основных секций
  const requiredSections = ['menu', 'experience', 'skills'];
  for (const section of requiredSections) {
    if (!globalData[section]) return false;
  }
  
  // Проверяем, что menu - это массив
  if (!Array.isArray(globalData.menu)) return false;
  
  // Проверяем, что experience - это объект со сценариями
  if (typeof globalData.experience !== 'object') return false;
  
  return true;
}

// Основная функция валидации
export function validateContentStructure(content) {
  const errors = [];
  
  // Проверяем, что content - это объект
  if (!content || typeof content !== 'object') {
    errors.push('Content must be an object');
    return { valid: false, errors };
  }
  
  // Проверяем наличие GLOBAL_DATA
  if (!content.GLOBAL_DATA) {
    errors.push('GLOBAL_DATA is required');
  } else if (!validateGlobalData(content.GLOBAL_DATA)) {
    errors.push('GLOBAL_DATA has invalid structure');
  }
  
  // Проверяем все профили (ключи в uppercase)
  let hasAtLeastOneProfile = false;
  for (const [key, value] of Object.entries(content)) {
    if (key === 'GLOBAL_DATA') continue;
    
    // Профили должны быть в uppercase
    if (key === key.toUpperCase()) {
      hasAtLeastOneProfile = true;
      if (!validateProfile(value)) {
        errors.push(`Profile ${key} has invalid structure`);
      }
    }
  }
  
  if (!hasAtLeastOneProfile) {
    errors.push('At least one profile is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Безопасное слияние объектов (для будущего PATCH метода)
export function deepMerge(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

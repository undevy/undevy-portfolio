// src/app/api/session/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
  }

  // Путь к файлу на сервере
  const dataFilePath = '/home/undevy/content.json';

  try {
    // Пытаемся прочитать файл с сервера
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const allData = JSON.parse(fileContent);
    
    // Ищем профиль пользователя
    const userProfile = allData[code];
    
    if (!userProfile) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 404 });
    }
    
    // Получаем глобальные данные
    const globalData = allData.GLOBAL_DATA;
    
    if (!globalData) {
      console.error('GLOBAL_DATA not found in content.json');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Умное слияние данных
    const sessionData = mergeSessionData(userProfile, globalData);
    
    return NextResponse.json(sessionData, { status: 200 });
    
  } catch (error) {
    console.warn(`Could not read server content file. Falling back to local test data. Reason: ${error.message}`);
    
    // В режиме разработки используем локальные тестовые данные
    try {
      const testFilePath = path.join(process.cwd(), 'src/app/test-content.json');
      const testContent = await fs.readFile(testFilePath, 'utf-8');
      const testData = JSON.parse(testContent);
      
      const userProfile = testData[code];
      
      if (!userProfile) {
        return NextResponse.json({ error: 'Invalid access code' }, { status: 404 });
      }
      
      const globalData = testData.GLOBAL_DATA;
      const sessionData = mergeSessionData(userProfile, globalData);
      
      return NextResponse.json(sessionData, { status: 200 });
      
    } catch (localError) {
      console.error('Failed to load test data:', localError);
      return NextResponse.json({ error: 'Server content file not found' }, { status: 500 });
    }
  }
}

// Функция для умного слияния данных пользователя и глобальных данных
function mergeSessionData(userProfile, globalData) {
  // Начинаем с базовой информации пользователя
  const sessionData = {
    // Метаданные и профиль пользователя
    ...userProfile,
    
    // Добавляем пункты меню (они одинаковые для всех)
    menu: globalData.menu,
    
    // Добавляем правильный timeline согласно конфигурации пользователя
    experience: globalData.experience[userProfile.meta.timeline] || [],
    
    // Добавляем все детали ролей (потом отфильтруем на клиенте по необходимости)
    role_details: globalData.role_details,
    
    // Фильтруем case studies согласно конфигурации пользователя
    case_studies: filterCaseStudies(globalData.case_studies, userProfile.meta.cases),
    
    // Добавляем все навыки
    skills: globalData.skills,
    
    // Добавляем дополнительные данные, если они есть
    skill_details: globalData.skill_details || {},
    case_details: globalData.case_details || {},
    side_projects: globalData.side_projects || [],
    public_speaking: globalData.public_speaking || [],
    contact: globalData.contact || {}
  };
  
  return sessionData;
}

// Функция для фильтрации case studies
function filterCaseStudies(allCases, selectedCaseIds) {
  if (!selectedCaseIds || selectedCaseIds.length === 0) {
    return allCases;
  }
  
  // Создаём новый объект только с выбранными кейсами
  const filteredCases = {};
  
  selectedCaseIds.forEach(caseId => {
    if (allCases[caseId]) {
      filteredCases[caseId] = allCases[caseId];
    }
  });
  
  return filteredCases;
}

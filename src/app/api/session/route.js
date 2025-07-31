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

  const dataFilePath = '/home/undevy/content.json';

  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const allData = JSON.parse(fileContent);
    
    const userProfile = allData[code];
    
    if (!userProfile) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 404 });
    }
    
    const globalData = allData.GLOBAL_DATA;
    
    if (!globalData) {
      console.error('GLOBAL_DATA not found in content.json');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const sessionData = mergeSessionData(userProfile, globalData);
    
    return NextResponse.json(sessionData, { status: 200 });
    
  } catch (error) {
    console.warn(`Could not read server content file. Falling back to local test data. Reason: ${error.message}`);
    
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

// Combines user profile with relevant parts of GLOBAL_DATA
function mergeSessionData(userProfile, globalData) {
  const sessionData = {
    ...userProfile,
    menu: globalData.menu,
    experience: globalData.experience[userProfile.meta.timeline] || [],
    role_details: globalData.role_details,
    case_studies: filterCaseStudies(globalData.case_studies, userProfile.meta.cases),
    skills: globalData.skills,
    skill_details: globalData.skill_details || {},
    case_details: globalData.case_details || {},
    side_projects: globalData.side_projects || [],
    public_speaking: globalData.public_speaking || [],
    contact: globalData.contact || {}
  };
  
  return sessionData;
}

// Filters case studies by user configuration
function filterCaseStudies(allCases, selectedCaseIds) {
  if (!selectedCaseIds || selectedCaseIds.length === 0) {
    return allCases;
  }
  
  const filteredCases = {};
  
  selectedCaseIds.forEach(caseId => {
    if (allCases[caseId]) {
      filteredCases[caseId] = allCases[caseId];
    }
  });
  
  return filteredCases;
}

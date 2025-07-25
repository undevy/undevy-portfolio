// src/app/api/session/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  // Extract the 'code' query parameter from the request URL
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
  }

  const dataFilePath = '/home/undevy/content.json';

  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const allUsers = JSON.parse(fileContent);
    const userData = allUsers[code];

    if (userData) {
      // If user data is found for the code, return it
      return NextResponse.json(userData, { status: 200 });
    } else {
      // If the code is not in our file, return a 404 Not Found
      return NextResponse.json({ error: 'Invalid access code' }, { status: 404 });
    }
  } catch (error) {
    // This catch block handles the case where we are in a local dev environment
    // and the file doesn't exist.
    console.warn(`Could not read server content file. Falling back to mock data. Reason: ${error.message}`);
    
    const mockData = {
      "LOCAL_TEST": {
        "company": "Local Dev Env",
        "access_level": "god_mode",
        "greeting_name": "Local Developer",
        "config": { "timeline": "all", "depth": "full", "tone": "casual" }
      }
    };

    const mockUser = mockData[code];
    if (mockUser) {
        return NextResponse.json(mockUser, { status: 200 });
    }

    // If the file doesn't exist AND the code is not LOCAL_TEST
    return NextResponse.json({ error: 'Server content file not found and invalid local code' }, { status: 500 });
  }
}
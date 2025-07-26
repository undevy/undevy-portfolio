// src/app/api/session/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';

export async function GET(request) {
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
      return NextResponse.json(userData, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 404 });
    }
  } catch (error) {
    console.warn(`Could not read server content file. Falling back to mock data. Reason: ${error.message}`);
    
    // THE FIX IS HERE: Mock data now has the same structure as the real data.
    const mockData = {
      "LOCAL_TEST": {
        "company": "Local Dev Env",
        "access_level": "god_mode",
        "greeting_name": "Local Developer",
        "profile_data": {
          "title": "Full-Stack Developer",
          "specialization": "React & Node.js",
          "background": "Problem Solver"
        },
        "introduction": {
          "technical": "This is the TECHNICAL introduction for local testing.",
          "casual": "This is the CASUAL introduction for local testing.",
          "formal": "This is the FORMAL introduction for local testing."
        },
        "config": {
          "timeline": "scenario_a",
          "depth": "full",
          "tone": "casual" // We can test different tones here
        }
      }
    };

    const mockUser = mockData[code];
    if (mockUser) {
        return NextResponse.json(mockUser, { status: 200 });
    }

    return NextResponse.json({ error: 'Server content file not found and invalid local code' }, { status: 500 });
  }
}
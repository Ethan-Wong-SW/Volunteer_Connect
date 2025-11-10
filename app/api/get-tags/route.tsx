// in app/api/get-tags/route.ts

import { NextResponse } from 'next/server';

// This is the URL of your Python "AI Brain"
const PYTHON_API_URL = 'http://127.0.0.1:8000/get-tags';

export async function POST(request: Request) {
  try {
    // 1. Get the { description: "..." } from the QuizModal
    const body = await request.json();
    const { description } = body;

    // 2. Call your Python API
    const apiResponse = await fetch(PYTHON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: description }),
    });

    if (!apiResponse.ok) {
      // If the Python API returned an error, pass it along
      const errorText = await apiResponse.text();
      console.error('Python API Error:', errorText);
      return NextResponse.json(
        { message: 'Error from AI service', error: errorText },
        { status: 500 }
      );
    }

    const data = await apiResponse.json();

    // 3. Send the AI's tag results back to the QuizModal
    return NextResponse.json(data.tags);

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
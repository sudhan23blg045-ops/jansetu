import { NextResponse } from "next/server";
import { processChatRequest } from "@/lib/ai/chatService";
import { ChatRequestPayload } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestPayload;

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request payload. 'messages' array is required." },
        { status: 400 }
      );
    }

    if (!body.languageCode) {
      return NextResponse.json(
        { error: "Invalid request payload. 'languageCode' is required." },
        { status: 400 }
      );
    }

    const reply = await processChatRequest(body.messages, body.languageCode);

    return NextResponse.json({ content: reply });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        fullError: error instanceof Error ? JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))) : error
      },
      { status: 500 }
    );
  }
}

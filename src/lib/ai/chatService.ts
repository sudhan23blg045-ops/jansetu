import { Mistral } from "@mistralai/mistralai";
import { ChatMessage } from "./types";
import { generateSystemPrompt } from "./systemPrompt";
import { supabase } from "../supabase";

export async function processChatRequest(
  messages: ChatMessage[],
  languageCode: string
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured.");
  }

  const client = new Mistral({ apiKey });
  
  // The last message is the prompt we want to send
  const latestMessage = messages[messages.length - 1];
  if (!latestMessage) {
    throw new Error("No messages provided to the chat service.");
  }

  // STEP 1: Intent & Needs Detection using JSON mode
  const intentPrompt = `Analyze the following conversation history to identify the user's needs. Broaden the search by identifying related categories that could help them. Extract keywords to search across these categories. Pay special attention to any previously shared information (e.g., age, location) to improve the extraction.

You MUST respond in valid JSON with exactly the following structure:
{
  "needs": ["string", "string"],
  "categories": ["SCHEMES", "NGOS", "LIVELIHOOD", "COMMUNITIES", "RESOURCES", "STATE_OFFICES"],
  "keywords": ["string", "string"],
  "location": "string"
}

Categories must ONLY be chosen from: SCHEMES, NGOS, LIVELIHOOD, COMMUNITIES, RESOURCES, STATE_OFFICES.
Keywords should be broad search keywords derived from needs to maximize search hits (English translation preferred).

Conversation History:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  let searchPlan = { needs: [] as string[], categories: [] as string[], keywords: [] as string[], location: "" };
  
  try {
    const intentResult = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: intentPrompt }],
      responseFormat: { type: "json_object" },
    });
    
    if (intentResult.choices && intentResult.choices[0] && intentResult.choices[0].message && intentResult.choices[0].message.content) {
      const contentStr = typeof intentResult.choices[0].message.content === 'string' 
        ? intentResult.choices[0].message.content 
        : JSON.stringify(intentResult.choices[0].message.content);
        
      searchPlan = JSON.parse(contentStr);
    }
  } catch (e) {
    console.error("Failed to parse search plan JSON or call Mistral intent model:", e);
  }

  const { needs, categories, keywords, location } = searchPlan;
  
  console.log("=== SEARCH PLAN ===");
  console.log("Needs:", needs);
  console.log("Categories:", categories);
  console.log("Keywords:", keywords);
  console.log("Location:", location);
  console.log("===================\n");

  // STEP 2: Broad Database Retrieval
  let contextData = "";
  const queriedSources: string[] = [];
  const contextParts: string[] = [];
  
  if (categories && categories.length > 0 && keywords && keywords.length > 0) {
    
    for (const category of categories) {
      try {
        if (category === "SCHEMES") {
          const orQuery = keywords.map(kw => `scheme_name.ilike.%${kw}%,description.ilike.%${kw}%,category.ilike.%${kw}%`).join(',');
          const { data } = await supabase.from('schemes').select('*').or(orQuery).limit(5);
          if (data && data.length > 0) {
            contextParts.push(`[SCHEMES]:\n${JSON.stringify(data)}`);
            queriedSources.push("Jansetu Government Schemes Database");
          }
        } 
        else if (category === "NGOS") {
          const orQuery = keywords.map(kw => `ngo_name.ilike.%${kw}%,description.ilike.%${kw}%,services.ilike.%${kw}%`).join(',');
          let query = supabase.from('ngos').select('*').or(orQuery).limit(5);
          if (location) {
            query = query.or(`district.ilike.%${location}%,address.ilike.%${location}%,state.ilike.%${location}%`);
          }
          const { data } = await query;
          if (data && data.length > 0) {
            contextParts.push(`[NGOS]:\n${JSON.stringify(data)}`);
            queriedSources.push("Jansetu NGO Directory");
          }
        }
        else if (category === "LIVELIHOOD") {
          const orQuery = keywords.map(kw => `title.ilike.%${kw}%,description.ilike.%${kw}%,category.ilike.%${kw}%`).join(',');
          let query = supabase.from('livelihood_opportunities').select('*').or(orQuery).limit(5);
          if (location) {
            query = query.or(`location.ilike.%${location}%`);
          }
          const { data } = await query;
          if (data && data.length > 0) {
            contextParts.push(`[LIVELIHOOD]:\n${JSON.stringify(data)}`);
            queriedSources.push("Jansetu Livelihood Opportunities");
          }
        }
        else if (category === "COMMUNITIES") {
          const orQuery = keywords.map(kw => `community_name.ilike.%${kw}%`).join(',');
          const { data } = await supabase.from('nomadic_communities').select('*').or(orQuery).limit(5);
          if (data && data.length > 0) {
            contextParts.push(`[COMMUNITIES]:\n${JSON.stringify(data)}`);
            queriedSources.push("Jansetu Communities Database");
          }
        }
        else if (category === "RESOURCES") {
          const orQuery = keywords.map(kw => `title.ilike.%${kw}%,description.ilike.%${kw}%,category.ilike.%${kw}%`).join(',');
          const { data } = await supabase.from('resources').select('*').or(orQuery).limit(5);
          if (data && data.length > 0) {
            contextParts.push(`[RESOURCES]:\n${JSON.stringify(data)}`);
            queriedSources.push("Jansetu Resources Database");
          }
        }
        else if (category === "STATE_OFFICES") {
          const orQuery = keywords.map(kw => `office_name.ilike.%${kw}%,state.ilike.%${kw}%`).join(',');
          const { data } = await supabase.from('state_offices').select('*').or(orQuery).limit(5);
          if (data && data.length > 0) {
            contextParts.push(`[STATE_OFFICES]:\n${JSON.stringify(data)}`);
            queriedSources.push("Jansetu State Offices Database");
          }
        }
      } catch (e) {
        console.error(`Database retrieval error for ${category}:`, e);
      }
    }
    
    if (contextParts.length > 0) {
      contextData = contextParts.join("\n\n");
    }
  }

  // Deduplicate sources
  const uniqueSources = Array.from(new Set(queriedSources));
  console.log("=== DB RECORD COUNTS ===");
  console.log("Context Parts retrieved:", contextParts.length);
  console.log("========================\n");

  // STEP 3: Generate Response with Context
  // Inject context into the system prompt
  let systemInstruction = generateSystemPrompt(languageCode, uniqueSources);
  
  if (contextData) {
    systemInstruction += `\n\nDATABASE CONTEXT:\n${contextData}\n\nIMPORTANT: Use ONLY the above database context to answer the user's query if possible. Return the most relevant records across categories to fulfill the user's needs.`;
  } else {
    systemInstruction += `\n\nIMPORTANT: No relevant database records were found across any category for the user's query in the Jansetu database. You may provide general knowledge and guidance to help the user. However, you MUST explicitly state that this is general guidance and was not retrieved from the official Jansetu database.`;
  }

  console.log("=== SYSTEM INSTRUCTION ===");
  console.log(systemInstruction.substring(0, 1000) + (systemInstruction.length > 1000 ? "...\n[TRUNCATED]" : ""));
  console.log("==========================\n");

  // Format messages for Mistral
  const mistralMessages: { role: "user" | "assistant" | "system", content: string }[] = [];
  
  // 1. Add system instruction
  mistralMessages.push({
    role: "system",
    content: systemInstruction
  });

  // 2. Add history and latest message
  for (const msg of messages) {
    mistralMessages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content
    });
  }

  try {
    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: mistralMessages,
    });
    
    if (chatResponse.choices && chatResponse.choices.length > 0 && chatResponse.choices[0].message) {
      const reply = chatResponse.choices[0].message.content;
      if (typeof reply === "string") {
        return reply;
      } else if (Array.isArray(reply)) {
        return reply.map((r: any) => r.text || "").join("");
      }
    }
    
    throw new Error("Empty response from Mistral AI.");
  } catch (error) {
    console.error("Mistral API Error:", error);
    throw error;
  }
}

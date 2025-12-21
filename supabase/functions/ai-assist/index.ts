import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: 'enhance-image' | 'suggest-description' | 'chat' | 'suggest-category';
  imageBase64?: string;
  style?: string;
  businessName?: string;
  category?: string;
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, imageBase64, style, businessName, category, messages, prompt }: AIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userContent: any = [];

    switch (type) {
      case 'enhance-image':
        systemPrompt = `You are an AI assistant specialized in analyzing product images for Indian local shops. 
When given a product image, provide:
1. A suggested product name based on what you see
2. A compelling description (2-3 sentences) highlighting key features
3. 3-5 relevant highlights/tags for the product
4. Suggested price range in INR based on typical Indian market prices

Be culturally aware of Indian products and pricing. Format your response as JSON:
{
  "productName": "...",
  "description": "...",
  "highlights": ["...", "..."],
  "priceRange": { "min": 0, "max": 0 },
  "style": "${style || 'clean'}"
}`;
        
        if (imageBase64) {
          userContent = [
            {
              type: "image_url",
              image_url: { url: imageBase64 }
            },
            {
              type: "text",
              text: `Analyze this product image with "${style || 'clean'}" style presentation in mind. Provide product details in JSON format.`
            }
          ];
        } else {
          userContent = [{ type: "text", text: "No image provided. Please describe a general product." }];
        }
        break;

      case 'suggest-description':
        systemPrompt = `You are a helpful assistant for Indian local shop owners. Generate compelling business descriptions in English and Hindi mix (Hinglish) that resonate with local customers. Keep it authentic and friendly.`;
        userContent = [{ 
          type: "text", 
          text: `Generate a short, engaging shop description (2-3 sentences) for "${businessName}" in the ${category} category. Make it sound authentic and trustworthy for Indian customers.` 
        }];
        break;

      case 'suggest-category':
        systemPrompt = `You are an assistant helping Indian shop owners categorize their business. Based on the business name and description, suggest the most appropriate category.`;
        userContent = [{ 
          type: "text", 
          text: prompt || `Suggest a category for this business: ${businessName}` 
        }];
        break;

      case 'chat':
        systemPrompt = `You are a helpful AI assistant for LocalDukan, an app connecting local Indian shops with customers. 
You help vendors with:
- Setting up their shop profile
- Taking better product photos
- Writing descriptions
- Understanding the platform
- Marketing tips for local businesses

Be friendly, use simple language, and be culturally aware of Indian small businesses.`;
        userContent = messages?.map(m => ({ type: "text", text: m.content })) || [{ type: "text", text: prompt || "Hello!" }];
        break;

      default:
        throw new Error("Invalid request type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse,
      type 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI assist error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: 'enhance-image' | 'suggest-description' | 'suggest-category' | 'search-help' | 'rate-help' | 'enhance-product-image' | 'suggest-product-description' | 'enhance-product-photo';
  imageBase64?: string;
  style?: string;
  businessName?: string;
  category?: string;
  prompt?: string;
  searchQuery?: string;
  productName?: string;
  enhancementType?: 'clean-background' | 'professional' | 'bright-lighting';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle image enhancement with image generation model
    if (body.type === 'enhance-product-photo' && body.imageBase64) {
      console.log("Enhancing product photo with AI...");
      
      const enhancementPrompts: Record<string, string> = {
        'clean-background': 'Enhance this product photo: remove the background and replace with a clean white studio background, improve lighting and color vibrancy, keep the product exactly the same',
        'professional': 'Enhance this product photo: make it look like a professional e-commerce product shot with clean background, improved lighting, sharper details, and vibrant colors',
        'bright-lighting': 'Enhance this product photo: improve brightness and lighting, make colors more vibrant and appealing, add subtle shadows for depth, keep background clean'
      };
      
      const enhancePrompt = enhancementPrompts[body.enhancementType || 'professional'];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: enhancePrompt },
                { type: "image_url", image_url: { url: body.imageBase64 } }
              ]
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Too many requests. Wait a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("AI image enhancement error:", status, await response.text());
        throw new Error("Image enhancement failed");
      }

      const data = await response.json();
      console.log("Image enhancement response received");
      
      // Extract the enhanced image from the response
      const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!enhancedImageUrl) {
        console.error("No image in response:", JSON.stringify(data).substring(0, 500));
        throw new Error("No enhanced image returned");
      }

      return new Response(JSON.stringify({ 
        success: true, 
        enhancedImageUrl,
        type: body.type 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";
    let maxTokens = 150;

    switch (body.type) {
      case 'enhance-image':
        systemPrompt = `You analyze product images for Indian shops. Return ONLY valid JSON, no extra text:
{"productName":"name","description":"1 sentence max 15 words","highlights":["tag1","tag2","tag3"],"priceRange":{"min":0,"max":0}}`;
        userPrompt = `Analyze this product image. Style: ${body.style || 'clean'}. Return JSON only.`;
        maxTokens = 200;
        break;

      case 'suggest-description':
        systemPrompt = `You write short shop descriptions for Indian businesses. Reply with ONLY 1-2 sentences in simple English. No options, no Hindi, no formatting. Max 25 words.`;
        userPrompt = `Write a short description for "${body.businessName}" (${body.category} shop).`;
        maxTokens = 60;
        break;

      case 'suggest-category':
        systemPrompt = `Suggest the best category for Indian shops. Reply with just the category name.`;
        userPrompt = `Best category for: ${body.businessName}`;
        maxTokens = 20;
        break;

      case 'search-help':
        systemPrompt = `You help users find local shops. Give 3 short search suggestions based on their query. Reply as comma-separated list only.`;
        userPrompt = `User searching: "${body.searchQuery}". Suggest 3 related searches.`;
        maxTokens = 50;
        break;

      case 'rate-help':
        systemPrompt = `Help users write short reviews. Reply with 1 sentence only, max 15 words.`;
        userPrompt = body.prompt || "Write a positive review.";
        maxTokens = 30;
        break;

      case 'enhance-product-image':
        systemPrompt = `Analyze product images. Return ONLY valid JSON:
{"productName":"detected name","description":"1 sentence max 20 words","priceRange":{"min":0,"max":0},"category":"category"}`;
        userPrompt = `Analyze this product image. Extract name, description, estimated price in INR, category. JSON only.`;
        maxTokens = 150;
        break;

      case 'suggest-product-description':
        systemPrompt = `Write short product descriptions. Reply with ONLY 1-2 sentences. Max 25 words. Simple English.`;
        userPrompt = `Write description for "${body.productName}"${body.category ? ` (${body.category})` : ''}.`;
        maxTokens = 50;
        break;

      default:
        throw new Error("Invalid request type");
    }

    const messages: any[] = [{ role: "system", content: systemPrompt }];
    
    // Handle image content for vision
    if ((body.type === 'enhance-image' || body.type === 'enhance-product-image') && body.imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: body.imageBase64 } },
          { type: "text", text: userPrompt }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    console.log(`AI request type: ${body.type}, maxTokens: ${maxTokens}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", status, await response.text());
      throw new Error("AI unavailable");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim() || "";
    
    console.log(`AI response: ${aiResponse.substring(0, 100)}...`);

    // For product image enhancement, try to parse JSON response
    if (body.type === 'enhance-product-image') {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const productInfo = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ success: true, productInfo, type: body.type }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        // Fall through to regular response
      }
    }

    return new Response(JSON.stringify({ success: true, response: aiResponse, type: body.type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI assist error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

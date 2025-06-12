import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { incidents } = await req.json()

    // Get Gemini API key from environment (server-side only)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      console.error('❌ Gemini API key not configured')
      throw new Error('Gemini API key not configured')
    }

    console.log(`🤖 Generating narrative for ${incidents.length} incidents...`)

    // Initialize Gemini AI with the correct model name
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create prompt for Gemini
    const incidentList = incidents
      .map((incident: any) => `- ${incident.author}: ${incident.action}`)
      .join('\n')

    const reportNumber = Math.floor(Math.random() * 9999) + 1;

    const prompt = `Turn the following list of banana-related Reddit user actions into a silly, absurd, chaotic narrative report. 

Make it fun and entertaining, like a news report from a fictional banana chaos simulator game. Use emojis and keep it under 500 characters. Start with "🍌 **Banana Chaos Report #${reportNumber}**".

Recent banana incidents:
${incidentList}

Create a short, funny report that summarizes these incidents in an entertaining way. End with "Stay slippery! 🍌" or similar.`

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const narrative = response.text();

    if (!narrative || narrative.trim().length === 0) {
      throw new Error('Empty response from Gemini AI')
    }

    console.log('✅ Narrative generated successfully')

    return new Response(
      JSON.stringify({ narrative: narrative.trim() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('❌ Error in generate-narrative function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
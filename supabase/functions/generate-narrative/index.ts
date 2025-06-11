import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { incidents } = await req.json()

    // Get Gemini API key from environment (server-side only)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Create prompt for Gemini
    const incidentList = incidents
      .map((incident: any) => `- ${incident.author}: ${incident.action}`)
      .join('\n')

    const prompt = `Turn the following list of banana-related Reddit user actions into a silly, absurd, chaotic narrative report. 

Make it fun and entertaining, like a news report from a fictional banana chaos simulator game. Use emojis and keep it under 500 characters. Start with "🍌 **Banana Chaos Report #X**" where X is a random number.

Recent banana incidents:
${incidentList}

Create a short, funny report that summarizes these incidents in an entertaining way. End with "Stay slippery. More chaos soon..." or similar.`

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const narrative = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!narrative) {
      throw new Error('No narrative generated')
    }

    return new Response(
      JSON.stringify({ narrative: narrative.trim() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
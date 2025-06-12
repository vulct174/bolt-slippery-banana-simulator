import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface RedditUserResponse {
  name: string;
  id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirect_uri } = await req.json()

    // Get Reddit credentials from environment
    const clientId = Deno.env.get('REDDIT_CLIENT_ID')
    const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET')
    const userAgent = Deno.env.get('REDDIT_USER_AGENT') || 'SlipperyBananaBot/1.0'

    // Use the redirect_uri from the request, or fall back to environment variable
    const redirectUri = redirect_uri || Deno.env.get('REDDIT_REDIRECT_URI')

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Reddit OAuth credentials not configured')
    }

    console.log('🔄 Exchanging OAuth code for tokens...')
    console.log('Using redirect URI:', redirectUri)

    // Exchange code for tokens
    const credentials = btoa(`${clientId}:${clientSecret}`)
    
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token exchange failed:', errorText)
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`)
    }

    const tokenData: RedditTokenResponse = await tokenResponse.json()
    console.log('✅ Tokens received, scopes:', tokenData.scope)

    // Get user info
    const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': userAgent
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to get user info')
    }

    const userData: RedditUserResponse = await userResponse.json()
    console.log('✅ User authenticated:', userData.name)

    // Store tokens in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authData = {
      username: userData.name,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
      scope: tokenData.scope,
      updated_at: new Date().toISOString()
    }

    const { error: upsertError } = await supabase
      .from('reddit_auth')
      .upsert(authData, { onConflict: 'username' })

    if (upsertError) {
      console.error('❌ Failed to store auth data:', upsertError)
      throw new Error('Failed to store authentication data')
    }

    console.log('💾 Authentication data stored successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        auth: {
          username: userData.name,
          scope: tokenData.scope,
          expires_at: Date.now() + (tokenData.expires_in * 1000)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
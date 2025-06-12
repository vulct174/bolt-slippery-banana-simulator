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
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the most recent auth record
    const { data: authData, error } = await supabase
      .from('reddit_auth')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !authData) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(authData.expires_at)
    
    if (now >= expiresAt) {
      // Try to refresh the token if we have a refresh token
      if (authData.refresh_token) {
        console.log('🔄 Access token expired, attempting refresh...')
        
        const clientId = Deno.env.get('REDDIT_CLIENT_ID')
        const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET')
        const userAgent = Deno.env.get('REDDIT_USER_AGENT') || 'SlipperyBananaBot/1.0'

        if (clientId && clientSecret) {
          try {
            const credentials = btoa(`${clientId}:${clientSecret}`)
            
            const refreshResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': userAgent
              },
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: authData.refresh_token
              })
            })

            if (refreshResponse.ok) {
              const refreshData: RedditTokenResponse = await refreshResponse.json()
              
              // Update the stored auth data
              const updatedAuth = {
                ...authData,
                access_token: refreshData.access_token,
                expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
                scope: refreshData.scope,
                updated_at: new Date().toISOString()
              }

              await supabase
                .from('reddit_auth')
                .update(updatedAuth)
                .eq('username', authData.username)

              console.log('✅ Token refreshed successfully')
              
              return new Response(
                JSON.stringify({ 
                  authenticated: true,
                  auth: {
                    username: authData.username,
                    scope: refreshData.scope,
                    expires_at: Date.now() + (refreshData.expires_in * 1000)
                  }
                }),
                {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                },
              )
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError)
          }
        }
      }
      
      // Token expired and couldn't refresh
      return new Response(
        JSON.stringify({ authenticated: false, expired: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Token is still valid
    return new Response(
      JSON.stringify({ 
        authenticated: true,
        auth: {
          username: authData.username,
          scope: authData.scope,
          expires_at: new Date(authData.expires_at).getTime()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('❌ Auth status check error:', error)
    return new Response(
      JSON.stringify({ authenticated: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
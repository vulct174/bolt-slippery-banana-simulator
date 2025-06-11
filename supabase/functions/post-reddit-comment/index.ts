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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content } = await req.json()

    // Get Reddit credentials from environment
    const clientId = Deno.env.get('REDDIT_CLIENT_ID')
    const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET')
    const username = Deno.env.get('REDDIT_USERNAME')
    const password = Deno.env.get('REDDIT_PASSWORD')
    const userAgent = Deno.env.get('REDDIT_USER_AGENT') || 'SlipperyBananaBot/1.0'

    if (!clientId || !clientSecret || !username || !password) {
      console.warn('⚠️ Reddit credentials not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Reddit credentials not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log('🔐 Authenticating with Reddit...')

    // Authenticate with Reddit
    const credentials = btoa(`${clientId}:${clientSecret}`)
    
    const authResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password
      })
    })

    if (!authResponse.ok) {
      throw new Error(`Reddit auth failed: ${authResponse.status} ${authResponse.statusText}`)
    }

    const tokenData: RedditTokenResponse = await authResponse.json()
    console.log('✅ Reddit authentication successful')

    // Post comment to the specific thread
    const POST_ID = '1l8o3ot'
    
    console.log('📝 Posting narrative to Reddit thread...')
    
    const commentResponse = await fetch('https://oauth.reddit.com/api/comment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent
      },
      body: new URLSearchParams({
        api_type: 'json',
        text: content,
        thing_id: `t3_${POST_ID}` // t3_ prefix for submissions
      })
    })

    if (!commentResponse.ok) {
      throw new Error(`Reddit comment failed: ${commentResponse.status} ${commentResponse.statusText}`)
    }

    const commentResult = await commentResponse.json()
    
    if (commentResult.json?.errors && commentResult.json.errors.length > 0) {
      throw new Error(`Reddit API errors: ${JSON.stringify(commentResult.json.errors)}`)
    }

    const commentId = commentResult.json?.data?.things?.[0]?.data?.id
    
    if (commentId) {
      console.log('✅ Narrative posted to Reddit successfully:', commentId)
      return new Response(
        JSON.stringify({ success: true, commentId }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } else {
      console.warn('⚠️ Narrative posted but no comment ID returned')
      return new Response(
        JSON.stringify({ success: true, commentId: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }
  } catch (error) {
    console.error('❌ Error in post-reddit-comment function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
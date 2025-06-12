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

interface RedditErrorResponse {
  json?: {
    errors?: Array<[string, string, string?]>;
  };
  error?: string;
  message?: string;
}

// Rate limiting state (per-function instance)
let lastPostTime = 0;
const MIN_POST_INTERVAL = 10000; // 10 seconds minimum between posts

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content } = await req.json()

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastPost = now - lastPostTime;
    
    if (timeSinceLastPost < MIN_POST_INTERVAL) {
      const waitTime = MIN_POST_INTERVAL - timeSinceLastPost;
      console.log(`⏳ Rate limiting: ${waitTime}ms remaining before next post allowed`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Rate limited. Please wait ${Math.ceil(waitTime / 1000)} seconds before posting again.`,
          retryAfter: waitTime
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Get Supabase client to fetch stored auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the most recent auth record
    const { data: authData, error: authError } = await supabase
      .from('reddit_auth')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (authError || !authData) {
      console.warn('⚠️ No Reddit authentication found, falling back to environment credentials')
      
      // Fallback to old method with environment variables
      const clientId = Deno.env.get('REDDIT_CLIENT_ID')
      const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET')
      const username = Deno.env.get('REDDIT_USERNAME')
      const password = Deno.env.get('REDDIT_PASSWORD')
      const userAgent = Deno.env.get('REDDIT_USER_AGENT') || 'SlipperyBananaBot/1.0'

      if (!clientId || !clientSecret || !username || !password) {
        return new Response(
          JSON.stringify({ success: false, error: 'No Reddit authentication available. Please authenticate via admin panel.' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Use old authentication method
      console.log('🔐 Using fallback authentication with username/password...')
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
        const authError = await authResponse.text()
        console.error('❌ Reddit authentication failed:', {
          status: authResponse.status,
          statusText: authResponse.statusText,
          error: authError
        })
        throw new Error(`Reddit auth failed: ${authResponse.status} ${authResponse.statusText}. Response: ${authError}`)
      }

      const tokenData: RedditTokenResponse = await authResponse.json()
      console.log('✅ Reddit authentication successful. Scopes:', tokenData.scope)

      // Check if we have the required scopes
      if (!tokenData.scope || !tokenData.scope.includes('submit')) {
        console.warn('⚠️ Missing required "submit" scope for posting comments')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Reddit app missing "submit" scope. Please check your Reddit app configuration.' 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Use the token to post comment
      return await postComment(tokenData.access_token, content, userAgent)
    }

    // Check if stored token is expired
    const now_date = new Date()
    const expiresAt = new Date(authData.expires_at)
    
    let accessToken = authData.access_token

    if (now_date >= expiresAt) {
      // Try to refresh the token
      if (authData.refresh_token) {
        console.log('🔄 Access token expired, refreshing...')
        
        const clientId = Deno.env.get('REDDIT_CLIENT_ID')
        const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET')
        const userAgent = Deno.env.get('REDDIT_USER_AGENT') || 'SlipperyBananaBot/1.0'

        if (clientId && clientSecret) {
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
            accessToken = refreshData.access_token
            
            // Update stored auth data
            await supabase
              .from('reddit_auth')
              .update({
                access_token: refreshData.access_token,
                expires_at: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
                scope: refreshData.scope,
                updated_at: new Date().toISOString()
              })
              .eq('username', authData.username)

            console.log('✅ Token refreshed successfully')
          } else {
            throw new Error('Failed to refresh access token')
          }
        } else {
          throw new Error('Cannot refresh token: missing client credentials')
        }
      } else {
        throw new Error('Access token expired and no refresh token available')
      }
    }

    // Use the access token to post comment
    const userAgent = Deno.env.get('REDDIT_USER_AGENT') || 'SlipperyBananaBot/1.0'
    const result = await postComment(accessToken, content, userAgent)
    
    // Update last post time on successful post
    if (result.ok) {
      lastPostTime = Date.now()
    }
    
    return result

  } catch (error) {
    console.error('❌ Error in post-reddit-comment function:', error)
    
    // Check if it's a rate limit error
    if (error.message && error.message.includes('RATELIMIT')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Reddit rate limit exceeded. Please wait before posting again.',
          isRateLimit: true
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function postComment(accessToken: string, content: string, userAgent: string) {
  // Post comment to the specific thread
  const POST_ID = '1l8o3ot'
  
  console.log('📝 Posting narrative to Reddit thread...')
  
  const commentResponse = await fetch('https://oauth.reddit.com/api/comment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
    const errorText = await commentResponse.text()
    let errorDetails = ''
    
    try {
      const errorJson = JSON.parse(errorText) as RedditErrorResponse
      if (errorJson.json?.errors && errorJson.json.errors.length > 0) {
        errorDetails = ` Reddit API errors: ${JSON.stringify(errorJson.json.errors)}`
        
        // Check for rate limit specifically
        const hasRateLimit = errorJson.json.errors.some(error => 
          error[0] === 'RATELIMIT' || error[1]?.includes('rate')
        )
        
        if (hasRateLimit) {
          throw new Error(`RATELIMIT: ${errorDetails}`)
        }
      } else if (errorJson.error) {
        errorDetails = ` Error: ${errorJson.error}`
      } else if (errorJson.message) {
        errorDetails = ` Message: ${errorJson.message}`
      }
    } catch (parseError) {
      if (parseError.message.includes('RATELIMIT')) {
        throw parseError // Re-throw rate limit errors
      }
      errorDetails = ` Response: ${errorText}`
    }

    console.error('❌ Reddit comment failed:', {
      status: commentResponse.status,
      statusText: commentResponse.statusText,
      response: errorText,
      postId: POST_ID
    })

    // Provide specific guidance based on error type
    let userFriendlyError = `Reddit comment failed: ${commentResponse.status} ${commentResponse.statusText}`
    
    if (commentResponse.status === 403) {
      userFriendlyError += '. This usually means: 1) Your Reddit account is restricted/shadowbanned, 2) Your account lacks permission to post in this subreddit, or 3) Your Reddit app needs the "submit" scope enabled.'
    } else if (commentResponse.status === 401) {
      userFriendlyError += '. Authentication failed - please re-authenticate via admin panel.'
    }

    userFriendlyError += errorDetails

    throw new Error(userFriendlyError)
  }

  const commentResult = await commentResponse.json()
  
  if (commentResult.json?.errors && commentResult.json.errors.length > 0) {
    console.error('❌ Reddit API returned errors:', commentResult.json.errors)
    
    // Check for rate limit in successful response
    const hasRateLimit = commentResult.json.errors.some((error: any) => 
      error[0] === 'RATELIMIT' || error[1]?.includes('rate')
    )
    
    if (hasRateLimit) {
      throw new Error(`RATELIMIT: Reddit API errors: ${JSON.stringify(commentResult.json.errors)}`)
    }
    
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
    console.warn('⚠️ Narrative posted but no comment ID returned. Full response:', commentResult)
    return new Response(
      JSON.stringify({ success: true, commentId: null }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}
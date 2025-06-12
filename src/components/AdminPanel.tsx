import React, { useState, useEffect } from 'react';
import { Shield, LogIn, LogOut, TestTube, CheckCircle, AlertCircle, Loader, Key } from 'lucide-react';

interface RedditToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  username: string;
  scope: string;
}

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [redditAuth, setRedditAuth] = useState<RedditToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testingComment, setTestingComment] = useState(false);

  // Check if environment variables are configured
  const isConfigured = () => {
    return !!(
      import.meta.env.VITE_REDDIT_CLIENT_ID &&
      import.meta.env.VITE_REDDIT_CLIENT_SECRET &&
      import.meta.env.VITE_REDDIT_REDIRECT_URI
    );
  };

  // Check admin password
  const handleAdminLogin = () => {
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'banana_admin_2025';
    if (adminPassword === correctPassword) {
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
      setError(null);
      checkExistingAuth();
    } else {
      setError('Invalid admin password');
    }
  };

  // Check for existing Reddit authentication
  const checkExistingAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reddit-auth-status`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setRedditAuth(data.auth);
        }
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'reddit_oauth_admin') {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, '/admin');
    }
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reddit-oauth-callback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRedditAuth(data.auth);
        setSuccess('Successfully authenticated with Reddit!');
      } else {
        setError(data.error || 'OAuth callback failed');
      }
    } catch (err) {
      setError('Failed to complete OAuth flow');
    } finally {
      setLoading(false);
    }
  };

  // Start Reddit OAuth flow
  const handleRedditLogin = () => {
    const clientId = import.meta.env.VITE_REDDIT_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDDIT_REDIRECT_URI;
    const state = 'reddit_oauth_admin';
    const scope = 'identity,submit';
    
    const authUrl = `https://www.reddit.com/api/v1/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `state=${state}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `duration=permanent&` +
      `scope=${scope}`;
    
    window.location.href = authUrl;
  };

  // Logout from Reddit
  const handleRedditLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reddit-logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setRedditAuth(null);
        setSuccess('Logged out from Reddit');
      }
    } catch (err) {
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  // Test Reddit comment posting
  const handleTestComment = async () => {
    try {
      setTestingComment(true);
      setError(null);
      
      const testContent = `🤖 **Bot Test Comment** - ${new Date().toLocaleString()}\n\nThis is a test comment from the Slippery Banana Bot admin panel. If you see this, the OAuth authentication is working correctly! 🍌\n\n*This comment was posted automatically for testing purposes.*`;
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/post-reddit-comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: testContent }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Test comment posted successfully! Comment ID: ${data.commentId}`);
      } else {
        setError(`Test comment failed: ${data.error}`);
      }
    } catch (err) {
      setError('Failed to post test comment');
    } finally {
      setTestingComment(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-red-500" size={32} />
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter admin password"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <AlertCircle className="text-red-400" size={16} />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}
            
            <button
              onClick={handleAdminLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Access Admin Panel
            </button>
            
            <p className="text-gray-400 text-xs text-center">
              This is a protected developer-only area
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConfigured()) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-400" size={24} />
              <h2 className="text-xl font-bold text-red-400">Configuration Required</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Reddit OAuth is not configured. Please set the following environment variables:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li><code className="bg-gray-800 px-2 py-1 rounded">VITE_REDDIT_CLIENT_ID</code></li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">VITE_REDDIT_CLIENT_SECRET</code></li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">VITE_REDDIT_REDIRECT_URI</code></li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">VITE_REDDIT_USER_AGENT</code> (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-red-500" size={32} />
                <div>
                  <h1 className="text-2xl font-bold">Reddit Bot Admin Panel</h1>
                  <p className="text-gray-400">Manage Reddit OAuth authentication</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Environment</div>
                <div className="text-green-400 font-medium">Configured ✓</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Messages */}
            {(error || success) && (
              <div className="space-y-2">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <AlertCircle className="text-red-400" size={16} />
                    <span className="text-red-400 flex-1">{error}</span>
                    <button onClick={clearMessages} className="text-red-400 hover:text-red-300">×</button>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-green-400 flex-1">{success}</span>
                    <button onClick={clearMessages} className="text-green-400 hover:text-green-300">×</button>
                  </div>
                )}
              </div>
            )}

            {/* Reddit Authentication Status */}
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="text-blue-400" size={24} />
                <h2 className="text-xl font-bold">Reddit Authentication</h2>
              </div>

              {redditAuth ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Username</div>
                      <div className="text-white font-medium">u/{redditAuth.username}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Scopes</div>
                      <div className="text-white font-medium">{redditAuth.scope}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Token Expires</div>
                      <div className="text-white font-medium">
                        {new Date(redditAuth.expires_at).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Status</div>
                      <div className="text-green-400 font-medium flex items-center gap-2">
                        <CheckCircle size={16} />
                        Authenticated
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleTestComment}
                      disabled={testingComment}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      {testingComment ? (
                        <Loader className="animate-spin" size={16} />
                      ) : (
                        <TestTube size={16} />
                      )}
                      Test Comment
                    </button>
                    
                    <button
                      onClick={handleRedditLogout}
                      disabled={loading}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                    
                    <button
                      onClick={handleRedditLogin}
                      disabled={loading}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <LogIn size={16} />
                      Re-authenticate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    No Reddit authentication found. Click below to authenticate the bot.
                  </div>
                  <button
                    onClick={handleRedditLogin}
                    disabled={loading}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors duration-200 mx-auto"
                  >
                    {loading ? (
                      <Loader className="animate-spin" size={20} />
                    ) : (
                      <LogIn size={20} />
                    )}
                    Log in with Reddit
                  </button>
                </div>
              )}
            </div>

            {/* Configuration Info */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3">Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Client ID</div>
                  <div className="text-white font-mono">
                    {import.meta.env.VITE_REDDIT_CLIENT_ID?.substring(0, 8)}...
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Redirect URI</div>
                  <div className="text-white font-mono break-all">
                    {import.meta.env.VITE_REDDIT_REDIRECT_URI}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
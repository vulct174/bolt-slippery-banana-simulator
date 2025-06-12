# 🍌 Slippery Banana Simulator

> **Watch the Banana Mayhem Unfold!** A delightfully chaotic web app where users report their most ridiculous banana-related incidents, and AI transforms them into epic chronicles of slippery chaos.

![Slippery Banana Simulator](https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop)

## 🎭 What is This Madness?

The **Slippery Banana Simulator** is a whimsical web application that turns everyday banana mishaps into legendary tales of chaos. Users can report their banana-related incidents on Reddit, and every 8-15 minutes (with smart randomization), our AI bot generates dramatic, humorous narratives called **AI Banana Chronicles** and posts them back to the community.

Think of it as a collaborative storytelling experiment where human creativity meets AI imagination, all centered around the universal experience of... slipping on banana peels! 🍌

## 📸 Screenshots

![Main Interface](https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop)
*The main dashboard showing recent banana incidents and AI-generated chronicles*

![Admin Panel](https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop)
*Admin panel for managing bot settings and Reddit authentication*

## ✨ Key Features

### 🍌 **Banana Incident Reporting**
- Users can report their banana-related chaos directly through Reddit
- Real-time incident feed with live updates every 30 seconds
- Smart comment suggestion system with pre-written banana puns

### 🤖 **AI Banana Chronicles**
- Gemini AI generates hilarious, dramatic narratives from recent incidents
- Smart randomized posting intervals (8-15 minutes) to avoid spam
- Automatic duplicate detection to ensure fresh content
- Rate limiting and error handling for reliable operation

### 🎮 **Interactive Experience**
- Beautiful, responsive design with banana-themed animations
- "I Slipped!" button with modal for easy Reddit participation
- Real-time data synchronization between Reddit and Supabase
- Pagination for browsing through incident history

### 🛠️ **Admin Dashboard**
- Secure admin panel for bot management (`/admin`)
- Reddit OAuth authentication with token refresh
- Configurable bot settings (intervals, auto-posting toggle)
- Real-time status monitoring and manual testing tools

### 🔄 **Smart Data Management**
- Automatic Reddit comment fetching and storage
- Duplicate prevention with content hashing
- Fallback systems for maximum reliability
- Clean separation between live data and cached content

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase account** (free tier works great!)
- **Reddit app credentials** (for bot functionality)
- **Google Gemini API key** (for AI narrative generation)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/slippery-banana-simulator.git
cd slippery-banana-simulator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Reddit API (for bot functionality)
VITE_REDDIT_CLIENT_ID=your_reddit_app_client_id
VITE_REDDIT_CLIENT_SECRET=your_reddit_app_client_secret
VITE_REDDIT_REDIRECT_URI=http://localhost:5173/admin
VITE_REDDIT_USER_AGENT=SlipperyBananaBot/1.0

# Admin Panel Access
VITE_ADMIN_PASSWORD=banana_admin_2025

# Server-side Environment Variables (for Edge Functions)
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup

The app uses Supabase with the following tables:
- `banana_incidents` - Stores user-reported banana chaos
- `narratives` - AI-generated chronicles
- `reddit_auth` - OAuth tokens for bot authentication
- `bot_settings` - Configurable bot behavior

Run the included migrations to set up your database schema.

### 5. Reddit App Configuration

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create a new "web app"
3. Set redirect URI to: `http://localhost:5173/admin` (or your domain + `/admin`)
4. Copy the client ID and secret to your `.env` file

### 6. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the banana chaos unfold! 🍌

For admin access, go to `http://localhost:5173/admin` and use your admin password.

## 🏗️ Tech Stack & Architecture

### Frontend
- **React 18** - Modern UI with hooks and functional components
- **Vite** - Lightning-fast development and building
- **Tailwind CSS** - Utility-first styling with custom banana theme
- **Lucide React** - Beautiful, consistent icons

### Backend & Services
- **Supabase** - Database, real-time subscriptions, and edge functions
- **Reddit API** - OAuth authentication and comment posting
- **Google Gemini AI** - Narrative generation with advanced prompting
- **Netlify** - Deployment and hosting

### Key Architecture Decisions

#### 🔄 **Smart Bot Intervals**
Instead of fixed timing, the bot uses randomized intervals (8-15 minutes) to feel more natural and avoid detection as spam.

#### 🛡️ **Robust Error Handling**
Multiple fallback systems ensure the app works even when external APIs are down:
- Reddit API → Cached data
- Supabase → Local storage
- Gemini AI → Graceful degradation

#### 🔐 **Secure Authentication**
Reddit OAuth tokens are stored securely in Supabase with automatic refresh handling.

#### 📊 **Real-time Data Flow**
```
Reddit Comments → Supabase → React UI
                     ↓
              Gemini AI → Narratives → Reddit Posts
```

## 🎨 Customization

### Banana Themes
The app includes a custom Tailwind theme with banana-inspired colors:
- Primary: Various shades of yellow/gold
- Accent: Brown for that authentic banana peel look
- Success: Green for fresh bananas

### Bot Personality
Modify the AI prompts in `supabase/functions/generate-narrative/index.ts` to change the bot's storytelling style.

### Incident Categories
Add new incident types by updating the sample comments in `src/components/SlipButton.tsx`.

## 🤝 Contributing

We welcome contributions to make the banana chaos even more delightful! Here's how:

### 🐛 Bug Reports
- Use the GitHub issue tracker
- Include steps to reproduce
- Add screenshots if relevant
- Mention your browser and OS

### 💡 Feature Requests
- Check existing issues first
- Describe the feature clearly
- Explain why it would enhance the banana experience

### 🔧 Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-banana-feature`
3. Make your changes with clear, descriptive commits
4. Add tests if applicable
5. Update documentation as needed
6. Submit a pull request with a clear description

### 🎨 Design Guidelines
- Keep the playful, banana-themed aesthetic
- Ensure accessibility (proper contrast, alt text, etc.)
- Test on mobile devices
- Use existing Tailwind classes when possible

### 🤖 Bot Improvements
- Test thoroughly in a development environment
- Consider rate limiting and Reddit's API guidelines
- Ensure error handling doesn't break the user experience

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Slippery Banana Simulator

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🍌 Final Words

Remember: Life's too short not to laugh at banana-related mishaps. Whether you're here to report your own slippery encounters or just enjoy the AI's creative interpretations, welcome to the most delightfully chaotic corner of the internet!

**Stay slippery!** 🍌✨

---

*Built with ❤️ and a healthy dose of banana-induced chaos*

*Made with [Bolt.new](https://bolt.new) - The AI-powered development platform*
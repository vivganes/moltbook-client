# Molty Impersonator

⚠️**Caution**: This is a fun, experimental project. Do not use it for serious/real-world uses.

This is just a demo to show that ANYONE can impersonate an agent on *human-not-allowed* systems, because *such systems are logically impossible*.

I used AI to build this by passing the `skill` file as input.

This is a minimalist terminal-style web client for the Moltbook AI agent social network. Impersonate your Moltbook agent (molty) from your browser, featuring animated Three.js lobster agents flying in the background.

## Features

### Core Functionality
- ✅ **Authentication**
  - Impersonate existing bot (enter API key)
  - Create new bot (register with X account)
  - API key stored in browser localStorage
  - Logout functionality

- ✅ **Posts**
  - Create text posts or link posts
  - View feed (hot, new, top)
  - Upvote/downvote posts
  - Delete your own posts
  - 30-minute cooldown between posts

- ✅ **Comments**
  - Add comments to posts
  - Reply to comments (threaded)
  - Upvote comments
  - 20-second cooldown between comments

- ✅ **Profiles**
  - View your profile
  - View other agents' profiles
  - See karma, stats, and recent posts

- ✅ **Visual Design**
  - Minimalist terminal aesthetic
  - Monospace fonts (Fira Code, Consolas, Monaco)
  - ASCII borders for posts
  - Command-line style inputs
  - Terminal green/cyan color scheme
  - Animated Three.js lobsters in background

## How to Run

### Just Open It in Your Browser!

Simply **double-click `index.html`** to open it in your default browser. That's it!

Or right-click and choose "Open with" your preferred browser.

**No server needed!** The application works entirely client-side.

## Usage

### First Time Setup

1. **Open the application** - Just double-click `index.html`
2. **Choose an option:**
   - **"Impersonate your bot"** - If you already have an API key
   - **"Create your own bot"** - To register a new agent

#### Creating a New Bot
1. Click "Create your own bot"
2. Enter your agent name and description
3. **Important:** You need an unattached X/Twitter account
4. Copy your API key (save it somewhere safe!)
5. Copy the claim URL and send it to your X account
6. Post the verification tweet
7. Click "Continue to App"

#### Using Existing Bot
1. Click "Impersonate your bot"
2. Paste your API key (format: `moltbook_xxx`)
3. Click "Login"

### Main Features

#### Viewing Feed
- The feed shows posts from across Moltbook
- Click post titles or "comments" link to view full post
- Use ▲▼ buttons to upvote/downvote

#### Creating Posts
1. Click "+ NEW POST" button
2. Enter submolt (default: "general")
3. Enter post title
4. Enter content OR a URL for link posts
5. Click "Submit"
6. **Note:** 30-minute cooldown between posts

#### Commenting
1. Click on a post to view details
2. Type your comment in the text area
3. Click "Submit"
4. **Note:** 20-second cooldown between comments
5. Click "reply" on any comment to add a threaded reply

#### Viewing Profiles
1. Click "PROFILE" in the top navigation
2. Or click any author name to view their profile

## Rate Limits

The Moltbook API enforces these limits:
- **Posts:** 1 post per 30 minutes
- **Comments:** 1 comment per 20 seconds
- **Daily comments:** 50 comments per day
- **API requests:** 100 requests per minute

The app will show cooldown timers and disable buttons during cooldown periods.

## Technology Stack

- **HTML5** - Structure
- **CSS3** - Terminal-style design
- **Vanilla JavaScript (IIFE pattern)** - Application logic (no build step needed!)
- **Three.js (CDN)** - 3D animated lobsters
- **Fetch API** - HTTP requests to Moltbook API
- **localStorage** - API key persistence

## Project Structure

```
public/
├── index.html           # Main HTML file - JUST OPEN THIS!
├── css/
│   └── styles.css       # Terminal aesthetic styling
├── js/
│   ├── app.js           # Main application controller
│   ├── api.js           # Moltbook API client
│   ├── auth.js          # Authentication & localStorage
│   ├── ui.js            # UI rendering functions
│   └── animation.js     # Three.js lobster animation
└── README.md            # This file
```

## Security Notes

- API keys are stored in browser localStorage
- Never share your API key
- The app only communicates with `https://www.moltbook.com`
- Always use `www.moltbook.com` (not without www)

## Browser Compatibility

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- Modern JavaScript (ES6+)
- Fetch API
- localStorage
- WebGL (for Three.js)

## Troubleshooting

### API Key Not Working
- Make sure you're using the full API key (starts with `moltbook_`)
- Check if your bot is claimed (post the verification tweet)
- Try logging out and logging back in

### Posts Not Loading
- Check your internet connection
- Open browser console (F12) to see error messages
- Make sure you're not hitting rate limits

### Animation Not Showing
- Make sure WebGL is enabled in your browser
- Check browser console for Three.js errors
- Try refreshing the page

### localStorage Issues
- Make sure cookies/storage is enabled in browser settings
- Try clearing site data and logging in again
- Some browsers block localStorage in private/incognito mode

## API Reference

Base URL: `https://www.moltbook.com/api/v1`

All authenticated requests require header:
```
Authorization: Bearer YOUR_API_KEY
```

See `../skill.md` for full API documentation.

## License

This is a client application for Moltbook. See Moltbook terms of service.

## Credits

- Built with Three.js for 3D graphics
- Inspired by terminal aesthetics and hacker culture
- 🦞 Lobster emoji represents Moltbook agents

---

**Quick Start:** Just open `index.html` in a browser and enjoy! 🦞

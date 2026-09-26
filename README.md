# Chirag Venkatesh — Personal Portfolio 🌱

A minimalist, high-performance portfolio website built with HTML, CSS, and Vanilla JavaScript. Designed with an elegant, responsive dark-mode-first aesthetic, featuring beautiful typography, interactive components, and dynamic animations.

**🌍 Live Site:** [https://chiragvenkatesh.vercel.app](https://chiragvenkatesh.vercel.app)


## ✨ Features

- **Editorial landing page:** A reference-inspired two-column layout with a handwritten name, compact work index, research reports, GitHub activity, and an original engraved hero illustration. Light mode uses crimson accents; dark mode is monochrome.
- **Light & Dark Mode:** Seamless theme switching managed via CSS variables and synced securely using `localStorage`, featuring a visually stunning, smooth sweep animation powered by the modern **View Transitions API**.
- **Interactive Floating Navigation:** A modern, glassmorphic pill-shaped bottom dock for effortless, persistent navigation across sections seamlessly on any device.
- **Dynamic Content Filtering:** An interactive Skills section that visually categorizes hardware and software domains (Physical Design, Verification, EDA Tools, etc.) with responsive JavaScript rendering.
- **Performance Optimized:** Built without bulky frameworks. Pure semantic HTML, Vanilla CSS, and native JavaScript ensure instant load times and liquid-smooth 60fps animations.
- **Sensible Layouts:** Clean typography powered by Google Fonts (Inter), consistent whitespace mapping, and subtle micro-interactions providing a premium UX.

## 🛠 Tech Stack

- **Structure:** Semantic HTML5
- **Styling:** Vanilla CSS (Modern Custom Variables, Flexbox, CSS Grid, Media Queries, Keyframes Backdrop-Filter)
- **Logic & Visuals:** Vanilla JavaScript (ES6+), Canvas API, IntersectionObserver API

## 🚀 Getting Started

Since this is a fully static ecosystem without framework-dependent bundlers, getting it running locally is incredibly simple.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/notsomeonebutnoone/portfolio.git
   ```

2. **Navigate into the directory:**
   ```bash
   cd portfolio
   ```

3. **Run locally:**
   ```bash
   npm install
   npm run dev
   ```

   Open `http://127.0.0.1:4173`. The local server mirrors the production rewrites for `/hardware`, `/software`, `/analyst`, and `/socials`, and executes the API routes. Use Node.js 22 or later.

## Socials and live updates

Each track has its own URL and detailed page, rendered through `track.html`. The pages share the landing page's palette, Geist typography, and editorial layout through `landing.css` and `track-editorial.css`. Navigation opens the selected page; the homepage remains an introduction and work index. Socials loads its platform feeds on its dedicated page.

The fourth track, `/socials`, features YouTube and Instagram `@creyn1um` and Twitter / X `@wo0tz0`. The existing three career tracks keep their own experience, projects, and résumés.

Copy `.env.example` to `.env.local` and supply credentials locally, or add the variables in the linked Vercel project's environment settings and redeploy:

| Variable | Purpose |
| --- | --- |
| `YOUTUBE_API_KEY` | Key from a Google project with YouTube Data API v3 enabled |
| `INSTAGRAM_USER_ID` | Numeric ID of the Instagram professional account |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Login token with `instagram_business_basic` and `instagram_business_manage_insights` permissions |
| `INSTAGRAM_API_VERSION` | Supported Graph API version, defaults to `v23.0` |
| `X_BEARER_TOKEN` | X API v2 token with user lookup and timeline read access |

Instagram requires a Business or Creator account and a valid token; renew expiring tokens through Meta. Platform access, quotas, and billing are managed in each provider's developer dashboard. Missing credentials produce a visible “Not connected” state, never simulated statistics. Credentials stay on the server and `.env.local` is ignored by Git.

The page requests `/api/socials?platform=youtube` (or `instagram` / `twitter`) on load, every 15 minutes while visible, and when Refresh updates is clicked. Successful responses are cached in the server process for 15 minutes; clicking Refresh rechecks that cache. Concurrent requests share one refresh. Failed requests retry after one minute and retain the last successful data in a warm server process or the current browser page, clearly marked as stale. The cache is not durable across server restarts.

Popularity is based on actual returned view counts, with the comparison scope shown beside the results:

- YouTube: walks up to 500 uploaded videos, then sorts by views; includes total channel views, subscribers, likes, and comments when available.
- Instagram: latest 50 media items and their view insights; unavailable insights are excluded from rankings, and followers, posts, likes, and comments remain visible.
- Twitter: latest 100 original posts, excluding replies and reposts. Popular posts rank by impressions. The top video ranks separately by media video views, including when it is attached to a post with multiple media items.

These are rankings within the fetched content, not an all-time claim when history is limited. New uploads appear on the next successful refresh. Missing metrics show “—”, while a reported zero stays zero. The old Instagram milestone is preserved as a historical résumé figure, separate from live metrics.

Run `npm test` for API normalization, ranking, failure, and request validation checks. Live account verification requires valid credentials for each provider.

API references: [YouTube channels](https://developers.google.com/youtube/v3/docs/channels/list), [YouTube uploads](https://developers.google.com/youtube/v3/guides/implementation/videos), [Instagram insights](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/insights), [X timelines](https://docs.x.com/x-api/users/get-posts), [X metrics](https://docs.x.com/x-api/fundamentals/metrics).

## 📁 Project Structure

```text
📦 portfolio
 ┣ 📜 index.html         # Editorial landing page and preserved portfolio copy
 ┣ 📜 landing.css        # Landing layout, responsive styles, and theme palettes
 ┣ 📜 landing.js         # Theme switching, navigation, and GitHub contributions
 ┣ 📂 assets            # Generated hero illustration and generation prompt
 ┣ 📜 style.css          # Core stylings, color palette vars, global media queries
 ┣ 📜 script.js          # Matrix Canvas renderer, intersection observers, data hydration
 ┣ 📜 3.png              # Dynamic Favicon tab icon
 ┗ 📜 channels4_profile-modified.png # Portfolio imagery
```

## 📬 Contact

Want to reach out? You can connect with me here:
- **Email**: [chirag42012@gmail.com](mailto:chirag42012@gmail.com)
- **GitHub**: [@notsomeonebutnoone](https://github.com/notsomeonebutnoone)
- **LinkedIn**: [Chirag Venkatesh](https://www.linkedin.com/in/chirag-v-1aa9b9204)

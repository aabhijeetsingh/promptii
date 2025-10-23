<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1I217YrvmuxhWXE2cHEJgZqo9L-ONh-vL

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Sign up/login to [Netlify](https://netlify.com)
3. Click "New site from Git" and connect your repository
4. Netlify will automatically detect the build settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Set environment variables in Netlify's dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key
6. Deploy the site

For local preview of the production build:
1. Run `npm run build`
2. Run `npm run preview` to preview the built site locally

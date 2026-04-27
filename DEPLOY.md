# Deploying Aether to cPanel (imbuckleyy.xyz)

To get your Aether dashboard live on your domain, follow these steps:

## 1. Prepare the Build
Run this command in your local terminal:
```bash
npm run build
```

## 2. Option A: Static Hosting (Easiest)
If you don't need any server-side logic (current version is all client-side), you can export it as a static site:
1. Update `next.config.ts` to include `output: 'export'`.
2. Run `npm run build`.
3. Upload the contents of the `out` folder directly to your `public_html` directory in cPanel via File Manager.

## 3. Option B: Node.js App (Recommended for Future)
1. Zip the following files:
   - `.next`
   - `public`
   - `package.json`
   - `next.config.ts`
2. In cPanel, go to **"Setup Node.js App"**.
3. Create a new app:
   - **Application root**: `/aether`
   - **Application URL**: `imbuckleyy.xyz`
   - **Application startup file**: `node_modules/next/dist/bin/next`
4. Upload your zip to the `/aether` folder and extract.
5. Run `npm install` from the Node.js app interface in cPanel.

## 4. Update Spotify
Once live, go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and add your production URL to the Redirect URIs:
- `https://imbuckleyy.xyz`

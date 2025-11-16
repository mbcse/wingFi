ICONS - Optional Addition

The extension is configured to work WITHOUT icons for faster development.

If you want to add custom icons later:

METHOD 1: Use the HTML Generator (Easiest)
1. Open icons/generate-icons.html in your browser
2. Click "Generate All Icons" 
3. Download all 3 icons (16px, 48px, 128px)
4. Save them in the icons/ folder
5. Add this back to manifest.json:

"action": {
  "default_popup": "popup.html",
  "default_icon": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
},
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}

METHOD 2: Use Any PNG Icons
- Just place any 3 PNG files named icon16.png, icon48.png, icon128.png in icons/
- Sizes: 16x16, 48x48, 128x128 pixels
- Then add the JSON snippet above to manifest.json

METHOD 3: Online Icon Maker
- Use https://www.favicon-generator.org/
- Upload a logo/image
- Generate and download multiple sizes
- Rename to icon16.png, icon48.png, icon128.png

The extension works fine without icons - they're just cosmetic for the Chrome toolbar!


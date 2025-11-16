#!/usr/bin/env node

/**
 * Quick script to generate placeholder PNG icons for the Chrome extension
 * Run: node create-icons.js
 */

const fs = require('fs');
const path = require('path');

// Simple SVG to use as a base
function createSVG(size) {
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" />
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.5}" fill="white" text-anchor="middle" dominant-baseline="middle">✈</text>
</svg>`.trim();
}

console.log('📦 Generating Chrome extension icons...\n');

const iconsDir = path.join(__dirname, 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('✓ Created icons/ directory');
}

const sizes = [16, 48, 128];

sizes.forEach(size => {
  const svg = createSVG(size);
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ Created icon${size}.svg`);
});

console.log('\n⚠️  SVG icons created, but Chrome requires PNG format.');
console.log('\n📝 To convert SVG to PNG, you have 3 options:\n');
console.log('Option 1 (Easiest): Open icons/generate-icons.html in browser and download PNGs');
console.log('Option 2: Use online converter: https://convertio.co/svg-png/');
console.log('Option 3: Install ImageMagick and run:');
console.log('  brew install imagemagick');
sizes.forEach(size => {
  console.log(`  convert icons/icon${size}.svg icons/icon${size}.png`);
});

console.log('\n✨ For now, using a temporary manifest fix...\n');

// Create a temporary manifest without icons
const manifestPath = path.join(__dirname, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Remove icon requirements temporarily
delete manifest.action.default_icon;
delete manifest.icons;

// Add a warning
manifest.description += ' (Dev Build - Missing Icons)';

// Save temporary manifest
const tempManifestPath = path.join(__dirname, 'manifest-no-icons.json');
fs.writeFileSync(tempManifestPath, JSON.stringify(manifest, null, 2));

console.log('✅ Created manifest-no-icons.json (temporary manifest without icons)');
console.log('\n🚀 Quick fix to load extension now:');
console.log('   1. Rename manifest.json to manifest-with-icons.json');
console.log('   2. Rename manifest-no-icons.json to manifest.json');
console.log('   3. Load extension in Chrome');
console.log('   4. Generate PNG icons later using the HTML tool');
console.log('   5. Restore original manifest when icons are ready\n');


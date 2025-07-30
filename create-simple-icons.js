// Simple icon creation script for Node.js
// Run with: node create-simple-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon and convert to different sizes
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#grad1)"/>
  
  <!-- Book shape -->
  <rect x="120" y="100" width="272" height="312" rx="20" fill="white" opacity="0.95"/>
  <rect x="120" y="100" width="20" height="312" rx="10" fill="white" opacity="0.8"/>
  
  <!-- Text -->
  <text x="160" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#667eea">📘</text>
  <text x="200" y="280" font-family="Arial, sans-serif" font-size="20" fill="#667eea">EN</text>
  <text x="160" y="310" font-family="Arial, sans-serif" font-size="18" fill="#764ba2">UZ</text>
  
  <!-- Star -->
  <polygon points="320,340 325,350 335,350 327,357 330,367 320,360 310,367 313,357 305,350 315,350" fill="#ffd700"/>
</svg>`;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Create SVG icons for different sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const specialIcons = [
  { name: 'favicon-16x16.svg', size: 16 },
  { name: 'favicon-32x32.svg', size: 32 },
  { name: 'apple-touch-icon.svg', size: 180 }
];

// Generate regular icons
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent);
  console.log(`Created icon-${size}x${size}.svg`);
});

// Generate special icons
specialIcons.forEach(icon => {
  const svgContent = createSVGIcon(icon.size);
  fs.writeFileSync(path.join(iconsDir, icon.name), svgContent);
  console.log(`Created ${icon.name}`);
});

console.log('All SVG icons created successfully!');
console.log('Note: For production, convert these SVG files to PNG using an online converter or image editing software.');
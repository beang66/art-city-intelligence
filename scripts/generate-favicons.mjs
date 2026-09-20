import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Exact brand mark geometry:
// Container: 31x31
// Skew: -28 deg around center (15.5, 15.5)
// Bar 1: (4, 2) w: 23, h: 7
// Bar 2: (0, 12) w: 23, h: 7
// Bar 3: (-4, 22) w: 23, h: 7
// Bounds after skew: X: [-11.18, 34.18] (width 45.36), Y: [2, 29] (height 27). Center: (11.5, 15.5)

// We define a 64x64 master SVG with the mark centered at (32, 32).
// Desired mark width ~ 48px -> scale = 48 / 45.36 ≈ 1.058
const scale = 1.058;
const targetCx = 32;
const targetCy = 32;
const origCx = 11.5;
const origCy = 15.5;
const tx = (targetCx - origCx * scale).toFixed(3);
const ty = (targetCy - origCy * scale).toFixed(3);

// 1. Transparent SVG Favicon with dark/light mode preference
// Suitable for browser tab icon (supports dark theme and light theme)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <style>
    .mark-bar { fill: #0c0d0f; }
    @media (prefers-color-scheme: dark) {
      .mark-bar { fill: #f5f5f7; }
    }
  </style>
  <g transform="translate(${tx}, ${ty}) scale(${scale})">
    <polygon class="mark-bar" points="11.18,2 34.18,2 30.46,9 7.46,9" />
    <polygon class="mark-bar" points="1.86,12 24.86,12 21.14,19 -1.86,19" />
    <polygon class="mark-bar" points="-7.46,22 15.54,22 11.82,29 -11.18,29" />
  </g>
</svg>
`;

// 2. High-contrast version for raster rendering (ICO and PNG)
// Using dark theme / luxury dark tile with rounded corners for app icons (Apple Touch Icon & Web App Icon)
// Matches --dark (#181a1f) or sleek #0c0d0f background with ivory #f5f5f7 bars and subtle border
const svgAppIconContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#0c0d0f"/>
  <rect x="1" y="1" width="510" height="510" rx="111" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
  <g transform="translate(${((256 - origCx * 8.4)).toFixed(3)}, ${((256 - origCy * 8.4)).toFixed(3)}) scale(8.4)">
    <polygon fill="#ffffff" points="11.18,2 34.18,2 30.46,9 7.46,9" />
    <polygon fill="#ffffff" points="1.86,12 24.86,12 21.14,19 -1.86,19" />
    <polygon fill="#ffffff" points="-7.46,22 15.54,22 11.82,29 -11.18,29" />
  </g>
</svg>
`;

// 3. Crisp transparent version for favicon.ico (supports both light and dark backgrounds with subtle stroke/halo)
const svgFaviconRaster = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="#0c0d0f" />
  <g transform="translate(${tx}, ${ty}) scale(${scale})">
    <polygon fill="#ffffff" points="11.18,2 34.18,2 30.46,9 7.46,9" />
    <polygon fill="#ffffff" points="1.86,12 24.86,12 21.14,19 -1.86,19" />
    <polygon fill="#ffffff" points="-7.46,22 15.54,22 11.82,29 -11.18,29" />
  </g>
</svg>
`;

// Build ICO from PNG buffers (standard Microsoft ICO format)
function buildIco(pngBuffersWithSizes) {
  // pngBuffersWithSizes = [{ size: 16, buffer: Buffer }, { size: 32, buffer: Buffer }, { size: 48, buffer: Buffer }]
  const count = pngBuffersWithSizes.length;
  const headerSize = 6;
  const directorySize = 16 * count;
  let offset = headerSize + directorySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const item of pngBuffersWithSizes) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 0); // width
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffersWithSizes.map(i => i.buffer)]);
}

async function main() {
  const root = process.cwd();
  const publicIconsDir = path.join(root, 'public', 'icons');
  const publicDir = path.join(root, 'public');
  const appDir = path.join(root, 'src', 'app');

  if (!fs.existsSync(publicIconsDir)) {
    fs.mkdirSync(publicIconsDir, { recursive: true });
  }

  // 1. Write SVG icons
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(publicIconsDir, 'icon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
  console.log('✓ Written icon.svg to src/app/, public/icons/, public/');

  // 2. Generate Apple Touch Icon (180x180 PNG)
  const appleIcon180 = await sharp(Buffer.from(svgAppIconContent))
    .resize(180, 180)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIcon180);
  fs.writeFileSync(path.join(publicIconsDir, 'apple-touch-icon.png'), appleIcon180);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon180);
  console.log('✓ Written apple-icon.png / apple-touch-icon.png (180x180)');

  // 3. Generate icon PNGs for PWA / Manifest / high-res
  const icon192 = await sharp(Buffer.from(svgAppIconContent))
    .resize(192, 192)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicIconsDir, 'icon-192.png'), icon192);

  const icon512 = await sharp(Buffer.from(svgAppIconContent))
    .resize(512, 512)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicIconsDir, 'icon-512.png'), icon512);

  // 4. Generate multi-resolution ICO file (16, 32, 48)
  const png16 = await sharp(Buffer.from(svgFaviconRaster))
    .resize(16, 16)
    .png()
    .toBuffer();
  const png32 = await sharp(Buffer.from(svgFaviconRaster))
    .resize(32, 32)
    .png()
    .toBuffer();
  const png48 = await sharp(Buffer.from(svgFaviconRaster))
    .resize(48, 48)
    .png()
    .toBuffer();

  const icoBuffer = buildIco([
    { size: 16, buffer: png16 },
    { size: 32, buffer: png32 },
    { size: 48, buffer: png48 }
  ]);

  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicIconsDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Written multi-resolution favicon.ico (16, 32, 48) to src/app/, public/, public/icons/');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

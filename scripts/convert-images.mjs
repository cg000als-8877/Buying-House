import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\cab63541-15a7-4e79-8c16-b11cd6e4120d';
const targetDir = path.resolve('public', 'images');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.jpg'));

const mapping = [
  { prefix: 'knitwear_collection', name: 'knitwear.webp' },
  { prefix: 'woven_shirting', name: 'woven.webp' },
  { prefix: 'denim_apparel', name: 'denim.webp' },
  { prefix: 'outerwear_jackets', name: 'outerwear.webp' },
  { prefix: 'activewear_athleisure', name: 'activewear.webp' },
  { prefix: 'sustainable_fabrics', name: 'sustainable.webp' },
  { prefix: 'factory_floor', name: 'factory-floor.webp' },
  { prefix: 'quality_assurance', name: 'quality-inspection.webp' },
  { prefix: 'pattern_cutting', name: 'pattern-cutting.webp' },
  { prefix: 'fashion_atelier', name: 'fashion-atelier.webp' },
  { prefix: 'global_logistics', name: 'global-logistics.webp' },
];

async function run() {
  console.log('Converting images to optimized WebP...');
  for (const item of mapping) {
    const matchedFile = files.find(f => f.startsWith(item.prefix));
    if (matchedFile) {
      const inputPath = path.join(sourceDir, matchedFile);
      const outputPath = path.join(targetDir, item.name);
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);
      const stats = fs.statSync(outputPath);
      console.log(`✓ Generated ${item.name} (${Math.round(stats.size / 1024)} KB)`);
    } else {
      console.warn(`! Not found: ${item.prefix}`);
    }
  }
  console.log('Image conversion complete!');
}

run().catch(console.error);

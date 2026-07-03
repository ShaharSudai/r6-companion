const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/constants/game-config.json');
const assetsDir = path.join(__dirname, '../assets/images');
const mapsDir = path.join(assetsDir, 'maps');
const operatorsDir = path.join(assetsDir, 'operators');
const faviconPath = path.join(assetsDir, 'favicon.png');
const outputAssetsFile = path.join(__dirname, '../src/constants/game-assets.ts');

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function generateAssets() {
  console.log('Starting asset generation...');
  
  if (!fs.existsSync(configPath)) {
    console.error(`Error: Config file not found at ${configPath}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const maps = config.maps || [];
  const operators = config.operators || [];

  ensureDirExists(mapsDir);
  ensureDirExists(operatorsDir);

  if (!fs.existsSync(faviconPath)) {
    console.error(`Error: Base PNG not found at ${faviconPath}`);
    process.exit(1);
  }

  // Copy placeholders for maps
  maps.forEach(map => {
    const destPath = path.join(mapsDir, `${map.id}.png`);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(faviconPath, destPath);
      console.log(`Generated map placeholder: ${map.id}.png`);
    }
  });

  // Copy placeholders for operators
  operators.forEach(op => {
    const destPath = path.join(operatorsDir, `${op.id}.png`);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(faviconPath, destPath);
      console.log(`Generated operator placeholder: ${op.id}.png`);
    }
  });

  // Generate game-assets.ts contents
  let fileContent = `/**
 * AUTO-GENERATED TACTICAL ASSETS MAPPING FILE
 * Run 'node scripts/generate-assets.js' to update when maps/operators are added or removed.
 */

export const MapImages: Record<string, any> = {
`;

  maps.forEach(map => {
    fileContent += `  '${map.id}': require('@/assets/images/maps/${map.id}.png'),\n`;
  });

  fileContent += `};\n\nexport const OperatorImages: Record<string, any> = {\n`;

  operators.forEach(op => {
    fileContent += `  '${op.id}': require('@/assets/images/operators/${op.id}.png'),\n`;
  });

  fileContent += `};\n`;

  fs.writeFileSync(outputAssetsFile, fileContent, 'utf8');
  console.log(`Generated assets mapping TS file at: ${outputAssetsFile}`);
  console.log('Asset generation complete! You can now overwrite the files in assets/images/maps/ and assets/images/operators/ with your actual images.');
}

generateAssets();

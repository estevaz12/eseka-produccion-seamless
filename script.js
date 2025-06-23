const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'produccion.txt');
const outputPath = path.join(__dirname, 'articulos_tabbed.txt');

fs.readFile(inputPath, 'utf8', (err, data) => {
  if (err) return console.error('❌ Error reading file:', err);

  const lines = data.split('\n');
  const result = [];

  for (let line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 3 && /^\d{5}$/.test(parts[0])) {
      const [articulo, pos, color] = parts;

      let talle, colorCode, fullCode;
      if (pos === 'PA') {
        talle = '9';
      } else {
        const match = pos.match(/^T\.(\d+)/);
        talle = match ? match[1] : '';
      }

      // Normalize values
      colorCode = color;
      fullCode = `${articulo}${talle}${colorCode}`;

      // Create tabbed row
      result.push(`${articulo}\t_\t${colorCode}\t${talle}\t${fullCode}`);
    }
  }

  fs.writeFile(outputPath, result.join('\n'), (err) => {
    if (err) console.error('❌ Error writing output:', err);
    else
      console.log(
        `✅ Done. Generated ${outputPath} with ${result.length} rows.`
      );
  });
});

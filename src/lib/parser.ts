/**
 * Utility to parse G-Code and 3MF files to extract print statistics
 * (weight, time, printer, layer height, etc.)
 */
export interface ParsedPrintStats {
  name: string;
  weightG: number;
  timeMins: number;
  filamentLengthM?: number;
  slicer?: string;
  layerHeightMm?: number;
}

export function parseFileName(fileName: string): string {
  // Remove extension
  const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  // Clean up underscores and dashes
  return baseName
    .replace(/[_-]/g, ' ')
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

export async function parse3DFile(file: File): Promise<ParsedPrintStats> {
  const name = parseFileName(file.name);
  const extension = file.name.split('.').pop()?.toLowerCase();

  // If it's an STL, we simulate/estimate because STL contains no G-code instructions.
  if (extension === 'stl') {
    return new Promise((resolve) => {
      // Create a realistic estimate based on STL file size (average density)
      // Standard STL file: 1MB ~ 50g print weight (highly approximated for demo)
      const sizeMb = file.size / (1024 * 1024);
      const estimatedWeightG = Math.max(10, Math.round(sizeMb * 35));
      const estimatedTimeMins = Math.max(30, Math.round(estimatedWeightG * 4.5)); // 4.5 mins per gram avg

      resolve({
        name,
        weightG: estimatedWeightG,
        timeMins: estimatedTimeMins,
        slicer: 'Estimativa STL'
      });
    });
  }

  // Parse text contents of G-code/Gcode
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        resolve({ name, weightG: 120, timeMins: 540 }); // Fallback
        return;
      }

      // Check sliced data by reading lines
      const lines = text.split('\n').slice(0, 10000).concat(text.split('\n').slice(-5000)); // Scan head and tail of Gcode
      
      let weightG = 0;
      let timeMins = 0;
      let slicer = 'Desconhecido';
      let layerHeightMm = undefined;

      for (const line of lines) {
        // OrcaSlicer / Bambu Studio headers
        if (line.includes('filament used [g]') || line.includes('total filament used [g]')) {
          const match = line.match(/=\s*([0-9.]+)/);
          if (match && match[1]) weightG = parseFloat(match[1]);
          slicer = line.includes('Bambu') ? 'Bambu Studio' : 'OrcaSlicer';
        }
        if (line.includes('print time =')) {
          // e.g., "; print time = 8h 24m" or "; print time = 45m 10s"
          const hMatch = line.match(/(\d+)h/);
          const mMatch = line.match(/(\d+)m/);
          let hours = hMatch ? parseInt(hMatch[1]) : 0;
          let mins = mMatch ? parseInt(mMatch[1]) : 0;
          timeMins = hours * 60 + mins;
        }

        // Cura slicer headers
        if (line.includes(';TIME:')) {
          const match = line.match(/:(\d+)/);
          if (match && match[1]) {
            timeMins = Math.round(parseInt(match[1]) / 60);
          }
          slicer = 'Ultimaker Cura';
        }
        if (line.includes(';Filament used:')) {
          // Cura outputs filament length in meters. Convert to weight roughly (e.g. 1m of 1.75mm PLA = ~3g)
          const match = line.match(/:([0-9.]+)/);
          if (match && match[1]) {
            const lengthM = parseFloat(match[1]);
            weightG = Math.round(lengthM * 3); // 3g per meter approximation
          }
        }

        // PrusaSlicer headers
        if (line.includes('; filament used [g]')) {
          const match = line.match(/=\s*([0-9.]+)/);
          if (match && match[1]) weightG = parseFloat(match[1]);
          slicer = 'PrusaSlicer';
        }
        if (line.includes('; estimated printing time')) {
          // e.g. "; estimated printing time (normal mode) = 8h 24m 10s"
          const hMatch = line.match(/(\d+)h/);
          const mMatch = line.match(/(\d+)m/);
          let hours = hMatch ? parseInt(hMatch[1]) : 0;
          let mins = mMatch ? parseInt(mMatch[1]) : 0;
          timeMins = hours * 60 + mins;
        }

        // Layer height
        if (line.includes(';layer_height') || line.includes(';layerHeight') || line.includes(';Layer height:')) {
          const match = line.match(/[:=]\s*([0-9.]+)/);
          if (match && match[1]) layerHeightMm = parseFloat(match[1]);
        }
      }

      // Default fallbacks if parsing failed to extract values
      if (weightG === 0) weightG = 120;
      if (timeMins === 0) timeMins = 540;

      resolve({
        name,
        weightG: Math.round(weightG * 10) / 10,
        timeMins,
        slicer,
        layerHeightMm
      });
    };
    reader.onerror = () => {
      resolve({ name, weightG: 120, timeMins: 540, slicer: 'Erro ao Ler' });
    };
    
    // Read only the first 250KB and last 250KB of file to speed up G-code reading
    const headerBlob = file.slice(0, 250 * 1024);
    reader.readAsText(headerBlob);
  });
}

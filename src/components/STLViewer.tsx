'use client';

import React, { useRef, useEffect, useState } from 'react';
import { RotateCw, Move } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Triangle {
  v1: Point3D;
  v2: Point3D;
  v3: Point3D;
  normal: Point3D;
}

interface STLViewerProps {
  file: File;
}

export default function STLViewer({ file }: STLViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [triangles, setTriangles] = useState<Triangle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Rotation angles
  const rotRef = useRef({ x: 0.5, y: 0.5 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Load and parse STL
  useEffect(() => {
    if (!file) return;

    setLoading(true);
    setError(false);
    setTriangles([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const parsed = parseSTL(buffer);
        setTriangles(parsed);
      } catch (err) {
        console.error('Error parsing STL: ', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError(true);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  // Parse STL helper
  const parseSTL = (buffer: ArrayBuffer): Triangle[] => {
    const view = new DataView(buffer);
    
    // Check if ASCII or Binary
    // Binary STL has 80 byte header, followed by 4 byte triangle count
    if (buffer.byteLength < 84) {
      throw new Error('File too small to be STL');
    }

    // A quick check if it's ASCII: scan first 100 bytes for "solid" keyword
    const isASCII = detectASCII(buffer);

    if (isASCII) {
      return parseASCII(buffer);
    } else {
      return parseBinary(buffer);
    }
  };

  const detectASCII = (buffer: ArrayBuffer): boolean => {
    const chars = new Uint8Array(buffer.slice(0, 100));
    let text = '';
    for (let i = 0; i < chars.length; i++) {
      text += String.fromCharCode(chars[i]);
    }
    return text.includes('solid') && !text.includes('\0');
  };

  const parseASCII = (buffer: ArrayBuffer): Triangle[] => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    const lines = text.split('\n');
    const list: Triangle[] = [];
    
    let v1: Point3D | null = null;
    let v2: Point3D | null = null;
    let v3: Point3D | null = null;
    let normal: Point3D = { x: 0, y: 0, z: 0 };

    // Max triangles limit to prevent canvas lag in browser (limit to 10k)
    for (let i = 0; i < lines.length && list.length < 10000; i++) {
      const line = lines[i].trim().toLowerCase();
      if (line.startsWith('facet normal')) {
        const parts = line.split(/\s+/);
        normal = {
          x: parseFloat(parts[2]) || 0,
          y: parseFloat(parts[3]) || 0,
          z: parseFloat(parts[4]) || 0
        };
      } else if (line.startsWith('vertex')) {
        const parts = line.split(/\s+/);
        const pt = {
          x: parseFloat(parts[1]) || 0,
          y: parseFloat(parts[2]) || 0,
          z: parseFloat(parts[3]) || 0
        };
        if (!v1) v1 = pt;
        else if (!v2) v2 = pt;
        else if (!v3) {
          v3 = pt;
          list.push({ v1, v2, v3, normal });
          v1 = null;
          v2 = null;
          v3 = null;
        }
      }
    }
    return list;
  };

  const parseBinary = (buffer: ArrayBuffer): Triangle[] => {
    const view = new DataView(buffer);
    const numTriangles = view.getUint32(80, true);
    const list: Triangle[] = [];
    
    // limit to 15k triangles to keep frames smooth in pure canvas projection
    const limit = Math.min(numTriangles, 15000);
    let offset = 84;

    for (let i = 0; i < limit; i++) {
      if (offset + 50 > buffer.byteLength) break;

      const normal = {
        x: view.getFloat32(offset, true),
        y: view.getFloat32(offset + 4, true),
        z: view.getFloat32(offset + 8, true),
      };

      const v1 = {
        x: view.getFloat32(offset + 12, true),
        y: view.getFloat32(offset + 16, true),
        z: view.getFloat32(offset + 20, true),
      };

      const v2 = {
        x: view.getFloat32(offset + 24, true),
        y: view.getFloat32(offset + 28, true),
        z: view.getFloat32(offset + 32, true),
      };

      const v3 = {
        x: view.getFloat32(offset + 36, true),
        y: view.getFloat32(offset + 40, true),
        z: view.getFloat32(offset + 44, true),
      };

      list.push({ v1, v2, v3, normal });
      offset += 50; // 4*3*4 + 2 bytes attribute
    }

    return list;
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || triangles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Get Bounding Box to center and scale
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    triangles.forEach(t => {
      [t.v1, t.v2, t.v3].forEach(v => {
        if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
        if (v.z < minZ) minZ = v.z; if (v.z > maxZ) maxZ = v.z;
      });
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const maxSpan = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const baseScale = (Math.min(canvas.width, canvas.height) * 0.5) / maxSpan;

    // Auto rotate state when not dragging
    let autoRotAngle = 0;

    const render = () => {
      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simple dark viewport grid styling
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Rotate model
      if (!isDraggingRef.current) {
        autoRotAngle += 0.005;
        rotRef.current.y = autoRotAngle;
      }

      const cosX = Math.cos(rotRef.current.x);
      const sinX = Math.sin(rotRef.current.x);
      const cosY = Math.cos(rotRef.current.y);
      const sinY = Math.sin(rotRef.current.y);

      // Project vertices
      const project = (p: Point3D) => {
        // Center translation
        let dx = p.x - centerX;
        let dy = p.y - centerY;
        let dz = p.z - centerZ;

        // Y-axis rotation
        let rx1 = dx * cosY - dz * sinY;
        let rz1 = dx * sinY + dz * cosY;

        // X-axis rotation
        let ry2 = dy * cosX - rz1 * sinX;
        let rz2 = dy * sinX + rz1 * cosX;

        // Orthographic projection
        const px = canvas.width / 2 + rx1 * baseScale;
        const py = canvas.height / 2 - ry2 * baseScale; // Flip Y for screen space

        return { x: px, y: py, z: rz2 };
      };

      // Sort triangles by average Z depth (painter's algorithm for flat shading)
      const sorted = triangles.map(t => {
        const p1 = project(t.v1);
        const p2 = project(t.v2);
        const p3 = project(t.v3);
        const avgZ = (p1.z + p2.z + p3.z) / 3;
        return { p1, p2, p3, avgZ, normal: t.normal };
      }).sort((a, b) => b.avgZ - a.avgZ);

      // Draw triangles
      sorted.forEach(({ p1, p2, p3, normal }) => {
        // Calculate basic directional lighting using normal projection
        // Light vector is slightly tilted: (0.3, 0.5, 1.0) normalized
        const lightX = 0.3, lightY = 0.5, lightZ = 0.8;
        
        // Simple dot product of normal and light (after rotating normal)
        let nx = normal.x * cosY - normal.z * sinY;
        let nz = normal.x * sinY + normal.z * cosY;
        let ny = normal.y * cosX - nz * sinX;
        nz = normal.y * sinX + nz * cosX;

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= len; ny /= len; nz /= len;

        const dot = Math.max(0.1, nx * lightX + ny * lightY + nz * lightZ);
        
        // Base violet color #8b5cf6
        const r = Math.round(139 * dot);
        const g = Math.round(92 * dot);
        const b = Math.round(246 * dot);

        // Draw flat shaded facet
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.strokeStyle = `rgba(139, 92, 246, 0.15)`; // subtle wireframe edge
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [triangles]);

  // Mouse drag handles
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    rotRef.current.y += deltaX * 0.01;
    rotRef.current.x += deltaY * 0.01;

    previousMousePositionRef.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  if (loading) {
    return (
      <div className="w-full h-44 rounded-xl bg-card border border-border flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-44 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col items-center justify-center text-destructive text-xs gap-1">
        <span className="font-semibold">Erro ao carregar renderizador 3D</span>
        <span className="text-[10px] opacity-75">O arquivo STL pode estar corrompido</span>
      </div>
    );
  }

  if (triangles.length === 0) return null;

  return (
    <div className="relative group rounded-xl border border-border/80 overflow-hidden bg-card/60">
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#121214]/85 text-[9px] text-muted-foreground flex items-center gap-1">
        <RotateCw className="w-3 h-3 animate-spin-slow" />
        <span>Modelo 3D</span>
      </div>
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#121214]/85 text-[9px] text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Move className="w-3 h-3" />
        <span>Arraste p/ rotacionar</span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={180}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-44 cursor-grab active:cursor-grabbing bg-black/40 block"
      />
    </div>
  );
}

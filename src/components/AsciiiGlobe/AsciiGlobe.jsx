import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Globe.css';
import earthTxt from './earth.txt?raw';

const AsciiGlobe = ({ width = 48, height = 48, ascii = " .:-=+*#%@", onUnmount }) => {
  const outputRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const rafRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    // Keep renderer pixel ratio stable so readPixels maps predictably
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    rendererRef.current = renderer;

    // Create globe (texture generated below from `earth.txt`)

    // Create a textured globe using the provided ASCII `earth.txt` as a texture
    // Parse the earth.txt raw content into a small canvas that becomes the sphere texture
    const rawLines = (earthTxt || '').split('\n').map(l => l.replace(/\r/g, ''))
      .filter((l, idx) => l.trim().length > 0 || (idx > 0 && idx < earthTxt.split('\n').length - 1));
    const cols = rawLines.reduce((m, l) => Math.max(m, l.length), 0) || 64;
    const rows = rawLines.length || 32;
    // target texture size (keep small for performance)
    const targetW = 256;
    const cell = Math.max(1, Math.floor(targetW / cols));
    const texW = cols * cell;
    const texH = rows * cell;
    const txtCanvas = document.createElement('canvas');
    txtCanvas.width = texW;
    txtCanvas.height = texH;
    const tctx = txtCanvas.getContext('2d');
    // background = deep ocean
    tctx.fillStyle = '#021018';
    tctx.fillRect(0, 0, texW, texH);
    // Map characters to brightness: '.' -> ocean (dark), others -> land (light)
    for (let y = 0; y < rows; y++) {
      const row = rawLines[y] || '';
      for (let x = 0; x < cols; x++) {
        const ch = row[x] || '.';
        if (ch === '.' || ch === ' ') {
          // ocean — a slightly bluish dark
          tctx.fillStyle = '#031a2b';
        } else {
          // land — use pale color
          tctx.fillStyle = '#dcd6c6';
        }
        tctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    const texture = new THREE.CanvasTexture(txtCanvas);
    texture.needsUpdate = true;

    // Sphere geometry sized smaller for a compact terminal display
    const radius = 2.2;
    // Use fewer segments for performance on small canvases
    const geometry = new THREE.SphereGeometry(radius, 32, 24);
    const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 1, metalness: 0.0 });
    const globe = new THREE.Mesh(geometry, material);
    globe.rotation.z = Math.PI;
    globe.rotation.y = 1.2;
    scene.add(globe);

    // Lighting tuned for contrast
    const ambient = new THREE.AmbientLight(0x001116, 0.6);
    scene.add(ambient);
    const key = new THREE.PointLight(0xffffff, 1.1, 0);
    key.position.set(80, -40, 160);
    scene.add(key);

    camera.position.z = 6;

    // Append renderer canvas to hidden container so readPixels works
    const container = canvasContainerRef.current;
    container.appendChild(renderer.domElement);

    // Prepare WebGL read buffer
    const gl = renderer.getContext();
    const pixels = new Uint8Array(width * height * 4);

    const ASCII = ascii;

    function reverseString(str) {
      return str.split('').reverse().join('');
    }

    function grayscale10(pixelsArr) {
      const len = pixelsArr.length;
      const gs = [];
      for (let i = 0; i < len; i += 4) {
        gs.push(Math.floor((pixelsArr[i] + pixelsArr[i + 1] + pixelsArr[i + 2]) / 768 * ASCII.length));
      }
      return gs;
    }

    function asciify(val, index) {
      let br = '';
      if (index !== 0 && index % width === 0) br = '\n';
      return br + ASCII[val];
    }

    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
    }

    function renderLoop() {
      rafRef.current = requestAnimationFrame(renderLoop);
      const t = performance.now() * 0.001;
      // rotation / subtle wobble for the textured globe
      globe.rotation.y -= 0.018 + 0.003 * Math.sin(t * 1.3);
      globe.rotation.x = 0.01 * Math.sin(t * 0.7);

      renderer.render(scene, camera);
      try {
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        const text = grayscale10(pixels).map(asciify).join('');
        const reversed = text.split('\n').map(reverseString).join('\n');

        // Post-process into lines with scanline/flicker/horizontal displacement
        const lines = reversed.split('\n');
        let html = '';
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // horizontal displacement oscillates with time + row index
          const offsetPx = Math.round((Math.sin(t * 10 + i * 0.2) * 2) + (Math.random() - 0.5) * 1.2);
          // flicker probability
          const flicker = Math.random() < 0.04; // 4% chance
          // scanline dimming for even rows
          const baseOpacity = (i % 2 === 0) ? 0.84 : 0.62;
          const opacity = flicker ? (0.2 + Math.random() * 0.3) : baseOpacity;

          // optionally replace a few chars to simulate noise when flickering
          let displayLine = line;
          if (flicker) {
            const chars = displayLine.split('');
            for (let k = 0; k < chars.length; k++) {
              if (Math.random() < 0.03) chars[k] = ' ';
            }
            displayLine = chars.join('');
          }

          // preserve leading spaces — escapeHtml then replace spaces with &nbsp;
          const escaped = escapeHtml(displayLine).replace(/ /g, '&nbsp;');
          html += `<span class="ascii-line" style="display:block; transform:translateX(${offsetPx}px); opacity:${opacity}">${escaped}</span>`;
        }

        if (outputRef.current) outputRef.current.innerHTML = html;
      } catch (e) {
        // readPixels may fail on some contexts; silently ignore
      }
    }

    renderLoop();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      if (typeof onUnmount === 'function') onUnmount();
    };
  }, [width, height, ascii, onUnmount]);

  return (
    <div className="ascii-globe-root">
      <div ref={canvasContainerRef} style={{ width: 0, height: 0, overflow: 'hidden' }} />
      <pre ref={outputRef} className="ascii-globe-output" aria-hidden={false} />
    </div>
  );
};

export default AsciiGlobe;

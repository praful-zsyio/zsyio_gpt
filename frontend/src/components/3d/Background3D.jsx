import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D({ theme = 'dark' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold all 3D objects
    const group = new THREE.Group();
    scene.add(group);

    const isLight = theme === 'light';

    // 1. Central Sky Blue Neural Icosahedron Wireframe
    const icoGeometry = new THREE.IcosahedronGeometry(9.5, 3);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: isLight ? 0x0284c7 : 0x38bdf8, // Deep blue in light mode, bright cyan in dark mode
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.32 : 0.22,
    });
    const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    group.add(icosahedron);

    // 2. Inner Glowing Geometry
    const innerGeom = new THREE.TorusKnotGeometry(4.8, 0.7, 100, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0x0369a1 : 0xffffff, // Deep ocean in light mode, crisp white in dark mode
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.38 : 0.32,
    });
    const innerKnot = new THREE.Mesh(innerGeom, innerMat);
    group.add(innerKnot);

    // 3. Second Concentric Sky Blue Ring
    const ringGeom = new THREE.TorusGeometry(12, 0.15, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0x0ea5e9 : 0x7dd3fc,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.30 : 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    group.add(ringMesh);

    // 4. Floating Sky Blue & White Stardust Particles
    const particlesCount = 450;
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    const skyColor = new THREE.Color(isLight ? 0x0284c7 : 0x38bdf8);
    const whiteColor = new THREE.Color(isLight ? 0x0369a1 : 0xffffff);
    const deepSkyColor = new THREE.Color(isLight ? 0x075985 : 0x0284c7);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 65;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 65;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 45;

      // Blend between Sky Blue, Light Sky, and Pure White
      const rand = Math.random();
      const mixedColor = rand < 0.4 ? whiteColor : rand < 0.7 ? skyColor : deepSkyColor;
      particleColors[i3] = mixedColor.r;
      particleColors[i3 + 1] = mixedColor.g;
      particleColors[i3 + 2] = mixedColor.b;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: isLight ? 0.35 : 0.3,
      vertexColors: true,
      transparent: true,
      opacity: isLight ? 0.75 : 0.85,
      blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    group.add(particleSystem);

    // Mouse tracking for fluid cursor interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseX = (e.clientX - halfW) / halfW;
      mouseY = (e.clientY - halfH) / halfH;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window Resize handling
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Smooth Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Fluid damping towards mouse
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Rotate geometries with subtle variation
      icosahedron.rotation.x = elapsedTime * 0.07;
      icosahedron.rotation.y = elapsedTime * 0.1;

      innerKnot.rotation.x = -elapsedTime * 0.12;
      innerKnot.rotation.y = elapsedTime * 0.15;

      ringMesh.rotation.z = elapsedTime * 0.05;

      particleSystem.rotation.y = elapsedTime * 0.025;

      // Dynamic 3D element reaction to cursor mouse movement
      group.rotation.y = targetX * 0.6;
      group.rotation.x = -targetY * 0.5;
      group.position.x = targetX * 3.0;
      group.position.y = -targetY * 3.0;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      icoGeometry.dispose();
      icoMaterial.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.9 }}
    />
  );
}

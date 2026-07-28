import { useEffect, useRef } from "react";
import * as THREE from "three";

function BackgroundFX() {
  const mountRef = useRef(null);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const count = 100;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      velocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x7c5cff,
      size: 0.22,
      transparent: true,
      opacity: 0.5,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3ddc97, transparent: true, opacity: 0.07 });
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(count * count * 3);
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    function updateLines() {
      let idx = 0;
      const posAttr = geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = posAttr.getX(i) - posAttr.getX(j);
          const dy = posAttr.getY(i) - posAttr.getY(j);
          const dz = posAttr.getZ(i) - posAttr.getZ(j);
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 6 && idx < linePositions.length - 6) {
            linePositions[idx++] = posAttr.getX(i);
            linePositions[idx++] = posAttr.getY(i);
            linePositions[idx++] = posAttr.getZ(i);
            linePositions[idx++] = posAttr.getX(j);
            linePositions[idx++] = posAttr.getY(j);
            linePositions[idx++] = posAttr.getZ(j);
          }
        }
      }
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions.slice(0, idx), 3));
      lineGeometry.attributes.position.needsUpdate = true;
    }

    let frame = 0;
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const posAttr = geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        posAttr.setX(i, posAttr.getX(i) + velocities[i].x);
        posAttr.setY(i, posAttr.getY(i) + velocities[i].y);
        posAttr.setZ(i, posAttr.getZ(i) + velocities[i].z);
      }
      posAttr.needsUpdate = true;
      frame++;
      if (frame % 4 === 0) updateLines();
      points.rotation.y += 0.0003;
      lines.rotation.y += 0.0003;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  return <div ref={mountRef} className="bg-fx" />;
}

export default BackgroundFX;
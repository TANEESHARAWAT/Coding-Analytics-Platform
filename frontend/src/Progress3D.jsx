import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function Progress3D({ stats }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current || stats.length === 0) return;

    const width = mountRef.current.clientWidth;
    const height = 500;

    const scene = new THREE.Scene();
    // no scene.background — stays transparent, page gradient shows through

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 8, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 30;

    const ambient = new THREE.AmbientLight(0x404060, 1.8);
    scene.add(ambient);
    const point1 = new THREE.PointLight(0x7c5cff, 1.5, 30);
    point1.position.set(-8, 10, 5);
    scene.add(point1);
    const point2 = new THREE.PointLight(0x3ddc97, 1.2, 30);
    point2.position.set(8, 10, -5);
    scene.add(point2);

    const gridHelper = new THREE.GridHelper(20, 20, 0x3a2f6a, 0x1a1830);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.25;
    scene.add(gridHelper);

    function lerpColor(pct) {
      const weak = new THREE.Color(0xff5470);
      const strong = new THREE.Color(0x3ddc97);
      return weak.lerp(strong, pct / 100);
    }

    function makeTextSprite(text, color) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.font = "600 26px 'Space Grotesk', sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(text, 128, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(4, 1, 1);
      return sprite;
    }

    const spacing = 3;
    const startX = -((stats.length - 1) * spacing) / 2;

    stats.forEach((s, i) => {
      const heightVal = Math.max(0.3, (s.percentage / 100) * 8);
      const color = lerpColor(s.percentage);

      const geometry = new THREE.BoxGeometry(1.2, heightVal, 1.2);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.25,
        metalness: 0.15,
        roughness: 0.6,
        transparent: true,
        opacity: 0.9,
      });
      const tower = new THREE.Mesh(geometry, material);
      tower.position.set(startX + i * spacing, heightVal / 2, 0);
      scene.add(tower);

      const label = makeTextSprite(`${s.concept}`, "#e7e8f2");
      label.position.set(startX + i * spacing, heightVal + 1.2, 0);
      scene.add(label);

      const pctLabel = makeTextSprite(`${s.percentage}%`, "#3ddc97");
      pctLabel.position.set(startX + i * spacing, heightVal + 0.4, 0);
      scene.add(pctLabel);
    });

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [stats]);

  if (stats.length === 0) {
    return <p style={{ color: "#8586a0" }}>No data yet — submit some code first.</p>;
  }

  return <div ref={mountRef} style={{ width: "100%" }} />;
}

export default Progress3D;
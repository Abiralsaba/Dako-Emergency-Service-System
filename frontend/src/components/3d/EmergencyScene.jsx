// src/components/3d/EmergencyScene.jsx
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Icosahedron, MeshDistortMaterial } from '@react-three/drei';

const AbstractCore = () => {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Icosahedron ref={meshRef} args={[1.8, 2]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#e11d48"
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          wireframe={true}
          speed={2}
          distort={0.4}
        />
      </Icosahedron>
    </Float>
  );
};

export default function EmergencyScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <color attach="background" args={['#09090b']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#e11d48" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#2563eb" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <AbstractCore />
    </Canvas>
  );
}

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface KindHandProps {
  position: [number, number, number];
  onDropComplete: () => void;
}

export const KindHand: React.FC<KindHandProps> = ({ position, onDropComplete }) => {
  const group = useRef<THREE.Group>(null);
  const [phase, setPhase] = useState<'DOWN' | 'DROP' | 'UP'>('DOWN');
  const [startTime] = useState(Date.now());

  useFrame((state) => {
    if (!group.current) return;
    
    const elapsed = (Date.now() - startTime) / 1000;

    if (phase === 'DOWN') {
        // Lerp down to y=3
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 3, 0.05);
        if (group.current.position.y < 3.2) {
            setPhase('DROP');
            onDropComplete(); // Trigger item spawn logic in parent
        }
    } else if (phase === 'DROP') {
        // Wait a split second
        if (elapsed > 2.5) setPhase('UP');
    } else if (phase === 'UP') {
        // Lerp up
        group.current.position.y += 0.1;
    }
  });

  return (
    <group ref={group} position={[position[0], 10, position[2]]}>
        {/* Palm */}
        <mesh castShadow>
            <boxGeometry args={[1.5, 0.5, 1.5]} />
            <meshStandardMaterial color="#ffdbac" />
        </mesh>
        {/* Fingers */}
        <mesh position={[-0.6, -0.5, 0]}>
             <boxGeometry args={[0.3, 0.8, 0.3]} />
             <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[-0.2, -0.6, 0]}>
             <boxGeometry args={[0.3, 1.0, 0.3]} />
             <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0.2, -0.6, 0]}>
             <boxGeometry args={[0.3, 0.9, 0.3]} />
             <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <mesh position={[0.6, -0.5, 0]}>
             <boxGeometry args={[0.3, 0.7, 0.3]} />
             <meshStandardMaterial color="#ffdbac" />
        </mesh>
    </group>
  );
};
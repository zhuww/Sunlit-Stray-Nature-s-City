
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pet, Position } from '../../types';
import { PetAvatar } from './PetAvatar';

interface PetFollowerProps {
  pet: Pet;
  targetPosition: Position;
  index: number;
  onClick: (id: string) => void;
}

export const PetFollower: React.FC<PetFollowerProps> = ({ pet, targetPosition, index, onClick }) => {
  const group = useRef<THREE.Group>(null);
  const type = pet.type;
  
  // Stagger follow distance if following
  const followDistance = 2.5 + index * 1.5;

  useFrame((state, delta) => {
    if (!group.current) return;

    const target = new THREE.Vector3(...targetPosition);
    
    // --- HELD MODE ---
    if (pet.isHeld) {
        // Instant snap to player relative position (carried)
        let offset = new THREE.Vector3(0, 0, 0);
        
        if (type === 'BIRD') {
            // Bird sits on shoulder/head area
            offset.set(0.4, 1.8, 0); 
        } else if (type === 'CAT') {
            // Cat held in left arm
            offset.set(0.4, 1.0, 0.4); 
        } else {
            // Dog held in right arm (or nearby)
            offset.set(-0.4, 1.0, 0.4); 
        }

        const finalPos = target.add(offset);
        
        // Use faster lerp for attachment feel
        group.current.position.lerp(finalPos, 0.2);
        
        // Bobbing with player
        group.current.position.y += Math.sin(state.clock.elapsedTime * 10) * 0.02;

        return; 
    }

    // --- FOLLOWING MODE ---

    // Birds fly high
    if (type === 'BIRD') {
        target.y += 4 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.5;
    } else {
        target.y = 0;
    }

    const current = group.current.position.clone();
    
    // Ignore Y for distance check on ground pets
    const flatTarget = new THREE.Vector3(target.x, 0, target.z);
    const flatCurrent = new THREE.Vector3(current.x, 0, current.z);
    const distance = flatTarget.distanceTo(flatCurrent);

    if (distance > followDistance) {
        const moveDir = new THREE.Vector3().subVectors(target, current).normalize();
        
        // Faster lerp for birds
        const speed = type === 'BIRD' ? 4 : 5;
        
        // Calculate ideal position
        const idealPos = target.clone().sub(moveDir.clone().multiplyScalar(followDistance));
        
        // Smoothly move
        group.current.position.lerp(idealPos, speed * delta);
        
        // Face movement
        group.current.lookAt(target);
    }

    // Animation loop
    if (type === 'BIRD') {
         // Keep height adjusted if needed
         if (!pet.isHeld) group.current.position.y = target.y; 
    } else {
        // Walking bob
        if (distance > followDistance + 0.1) {
             group.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.2;
        } else {
             group.current.position.y = 0;
        }
    }
  });

  return (
    <group 
        ref={group} 
        position={[targetPosition[0] + followDistance, type === 'BIRD' ? 4 : 0, targetPosition[2] + followDistance]}
        onClick={(e) => {
            e.stopPropagation();
            onClick(pet.id);
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
    >
        <PetAvatar 
            type={pet.type} 
            breed={pet.breed} 
            accessories={pet.accessories} 
        />
    </group>
  );
};

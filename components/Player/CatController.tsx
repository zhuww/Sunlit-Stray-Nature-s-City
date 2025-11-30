import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Position } from '../../types';
import { TILE_SIZE } from '../World/CityBuilder';

interface CatControllerProps {
  buildings: { position: [number, number, number]; height: number }[];
  onPositionChange: (pos: Position) => void;
  gameActive: boolean;
  isSleeping: boolean;
}

export const CatController: React.FC<CatControllerProps> = ({ buildings, onPositionChange, gameActive, isSleeping }) => {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Input state
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (isSleeping) {
        // Sleeping animation: slight breathing scale
        const breath = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        group.current.scale.set(1, breath * 0.8, 1); // Flatten slightly when sleeping
        group.current.rotation.z = Math.PI / 8; // Tilt slightly
        group.current.position.y = 0.2; // Lower to ground
        
        // Gentle Camera drift when sleeping
        const camOffset = new THREE.Vector3(0, 3, 5);
        const targetCamPos = group.current.position.clone().add(camOffset);
        camera.position.lerp(targetCamPos, 0.02);
        camera.lookAt(group.current.position);
        return;
    }

    // Reset scale if waking up
    group.current.scale.set(1, 1, 1);
    group.current.rotation.z = 0;

    if (!gameActive) return;

    const speed = 8 * delta;
    const rotationSpeed = 5 * delta;
    const currentPos = group.current.position.clone();
    
    let moveX = 0;
    let moveZ = 0;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) moveZ = -1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) moveZ = 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveX = -1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) moveX = 1;

    // Movement vector relative to camera (simplified to world axis for now to avoid dizziness)
    const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize();
    
    if (moveVector.length() > 0) {
        // Rotate cat to face movement
        const targetRotation = Math.atan2(moveVector.x, moveVector.z);
        
        // Smooth rotation
        let rotDiff = targetRotation - group.current.rotation.y;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        group.current.rotation.y += rotDiff * rotationSpeed * 5;

        // Apply movement
        const potentialPos = currentPos.clone().add(moveVector.multiplyScalar(speed));

        // Basic Collision Detection with Buildings
        let collided = false;
        const catRadius = 0.5;

        for (const b of buildings) {
             const bMinX = b.position[0] - TILE_SIZE/2;
             const bMaxX = b.position[0] + TILE_SIZE/2;
             const bMinZ = b.position[2] - TILE_SIZE/2;
             const bMaxZ = b.position[2] + TILE_SIZE/2;

             if (potentialPos.x > bMinX - catRadius && potentialPos.x < bMaxX + catRadius &&
                 potentialPos.z > bMinZ - catRadius && potentialPos.z < bMaxZ + catRadius) {
                 collided = true;
                 break;
             }
        }

        // Boundary Check
        if (Math.abs(potentialPos.x) > 40 || Math.abs(potentialPos.z) > 40) collided = true;

        if (!collided) {
            group.current.position.copy(potentialPos);
        }
    }
    
    // Bobbing animation
    if (moveVector.length() > 0) {
        group.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.2;
    } else {
        group.current.position.y = 0;
    }

    // Camera follow
    const camOffset = new THREE.Vector3(0, 5, 8);
    const targetCamPos = group.current.position.clone().add(camOffset);
    camera.position.lerp(targetCamPos, 0.1);
    camera.lookAt(group.current.position);

    // Update parent state occasionally
    onPositionChange([group.current.position.x, group.current.position.y, group.current.position.z]);
  });

  return (
    <group ref={group}>
      {/* White Cat Model */}
      <group position={[0, 0.25, 0]}>
         {/* Body */}
         <mesh castShadow position={[0, 0.2, 0]}>
             <boxGeometry args={[0.5, 0.45, 0.7]} />
             <meshStandardMaterial color="#FFFFFF" />
         </mesh>
         
         {/* Head */}
         <mesh position={[0, 0.5, -0.45]} castShadow>
             <boxGeometry args={[0.45, 0.4, 0.4]} />
             <meshStandardMaterial color="#FFFFFF" />
         </mesh>

         {/* Eyes */}
         <mesh position={[-0.12, 0.55, -0.66]}>
             <sphereGeometry args={[0.04, 8, 8]} />
             <meshStandardMaterial color="black" />
         </mesh>
         <mesh position={[0.12, 0.55, -0.66]}>
             <sphereGeometry args={[0.04, 8, 8]} />
             <meshStandardMaterial color="black" />
         </mesh>

         {/* Ears */}
         <mesh position={[-0.15, 0.75, -0.45]} rotation={[0, 0, 0.2]}>
             <coneGeometry args={[0.08, 0.2, 4]} />
             <meshStandardMaterial color="#FFFFFF" />
         </mesh>
         {/* Inner Ear Pink */}
         <mesh position={[-0.15, 0.75, -0.44]} rotation={[0, 0, 0.2]} scale={[0.6, 0.6, 0.6]}>
             <coneGeometry args={[0.08, 0.2, 4]} />
             <meshStandardMaterial color="#FFB6C1" />
         </mesh>

         <mesh position={[0.15, 0.75, -0.45]} rotation={[0, 0, -0.2]}>
             <coneGeometry args={[0.08, 0.2, 4]} />
             <meshStandardMaterial color="#FFFFFF" />
         </mesh>
         <mesh position={[0.15, 0.75, -0.44]} rotation={[0, 0, -0.2]} scale={[0.6, 0.6, 0.6]}>
             <coneGeometry args={[0.08, 0.2, 4]} />
             <meshStandardMaterial color="#FFB6C1" />
         </mesh>

         {/* Tail */}
         <mesh position={[0, 0.4, 0.4]} rotation={[0.5, 0, 0]} castShadow>
             <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
             <meshStandardMaterial color="#FFFFFF" />
         </mesh>
         
         {/* Legs */}
         <mesh position={[-0.15, 0, -0.25]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" />
         </mesh>
         <mesh position={[0.15, 0, -0.25]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" />
         </mesh>
         <mesh position={[-0.15, 0, 0.25]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" />
         </mesh>
         <mesh position={[0.15, 0, 0.25]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" />
         </mesh>

      </group>
    </group>
  );
};
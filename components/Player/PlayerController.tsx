

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Position, Building, CharacterAppearance, Vehicle } from '../../types';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerControllerProps {
  buildings: Building[];
  onPositionChange: (pos: Position) => void;
  onInteract: (building: Building) => void;
  position: Position; 
  isWorking: boolean;
  boundary?: number;
  appearance: CharacterAppearance;
  vehicle: Vehicle | null;
}

const CarMesh: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
    return (
        <group>
            {/* Chassis */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[2, 1, 4]} />
                <meshStandardMaterial color={vehicle.color} />
            </mesh>

            {/* Cabin */}
            {vehicle.style === 'SEDAN' && (
                <mesh position={[0, 1.2, -0.2]}>
                     <boxGeometry args={[1.8, 0.8, 2]} />
                     <meshStandardMaterial color="#333" />
                </mesh>
            )}
            {vehicle.style === 'SUV' && (
                <mesh position={[0, 1.3, 0]}>
                     <boxGeometry args={[1.9, 1.0, 3]} />
                     <meshStandardMaterial color="#333" />
                </mesh>
            )}
            {vehicle.style === 'SPORTS' && (
                 <mesh position={[0, 1.0, -0.5]}>
                    <boxGeometry args={[1.8, 0.6, 1.5]} />
                    <meshStandardMaterial color="#333" />
                 </mesh>
            )}
            {vehicle.style === 'SPORTS' && (
                <mesh position={[0, 0.5, 2]}>
                    <boxGeometry args={[2, 0.2, 0.5]} />
                    <meshStandardMaterial color="black" />
                </mesh>
             )}

            {/* Wheels */}
            {[{x: 1, z: 1.2}, {x: -1, z: 1.2}, {x: 1, z: -1.2}, {x: -1, z: -1.2}].map((pos, i) => (
                <mesh key={i} position={[pos.x, 0.4, pos.z]} rotation={[0, 0, Math.PI/2]}>
                     <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
                     <meshStandardMaterial color="#1f2937" />
                </mesh>
            ))}
            {/* Headlights */}
            <mesh position={[0.6, 0.6, 2]} rotation={[0, 0, 0]}>
                 <sphereGeometry args={[0.2]} />
                 <meshStandardMaterial color="#fef08a" emissive="#fef08a" />
            </mesh>
            <mesh position={[-0.6, 0.6, 2]} rotation={[0, 0, 0]}>
                 <sphereGeometry args={[0.2]} />
                 <meshStandardMaterial color="#fef08a" emissive="#fef08a" />
            </mesh>
        </group>
    )
}

export const PlayerController: React.FC<PlayerControllerProps> = ({ buildings, onPositionChange, onInteract, position, isWorking, boundary = 55, appearance, vehicle }) => {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { 
        keys.current[e.code] = false; 
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (group.current) {
        group.current.position.set(...position);
    }
  }, [position]);

  useFrame((state, delta) => {
    if (!group.current) return;
    
    if (isWorking) return;

    // Faster speed if vehicle
    const baseSpeed = vehicle ? 30 : 15;
    const speed = baseSpeed * delta;
    const currentPos = group.current.position.clone();
    
    let moveX = 0;
    let moveZ = 0;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) moveZ = -1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) moveZ = 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveX = -1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) moveX = 1;

    const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize();
    
    if (moveVector.length() > 0) {
        const targetRotation = Math.atan2(moveVector.x, moveVector.z);
        
        let rotDiff = targetRotation - group.current.rotation.y;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        
        // Slower rotation for car feeling
        const rotSpeed = vehicle ? 3 : 10;
        group.current.rotation.y += rotDiff * rotSpeed * delta;

        const potentialPos = currentPos.clone().add(moveVector.multiplyScalar(speed));
        
        if (Math.abs(potentialPos.x) < boundary && Math.abs(potentialPos.z) < boundary) {
             group.current.position.copy(potentialPos);
        }
        
        if (!vehicle) {
            group.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1;
        } else {
            group.current.position.y = 0; // Cars don't bob
        }
    } else {
        if (!vehicle) group.current.position.y = 0;
    }

    const camOffset = new THREE.Vector3(0, 20, 20);
    camera.position.lerp(group.current.position.clone().add(camOffset), 0.1);
    camera.lookAt(group.current.position);

    onPositionChange([group.current.position.x, group.current.position.y, group.current.position.z]);

    if (buildings) {
        const interactBuilding = buildings.find(b => {
            const dx = b.position[0] - group.current!.position.x;
            const dz = b.position[2] - group.current!.position.z;
            return Math.sqrt(dx*dx + dz*dz) < 6; 
        });

        if (interactBuilding) {
            onInteract(interactBuilding);
        } else {
            onInteract(null as any);
        }
    }
  });

  return (
    <group ref={group} position={position}>
        {vehicle ? (
            <CarMesh vehicle={vehicle} />
        ) : (
            <PlayerAvatar appearance={appearance} isWalking />
        )}
    </group>
  );
};
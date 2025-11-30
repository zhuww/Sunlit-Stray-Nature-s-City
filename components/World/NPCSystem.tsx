
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NPC, Position, CharacterAppearance, Vehicle } from '../../types';
import { PlayerAvatar } from '../Player/PlayerAvatar';
import { PetAvatar } from '../Player/PetAvatar';
import { Html } from '@react-three/drei';

interface NPCSystemProps {
    npcs: NPC[];
    onUpdate: (npcs: NPC[]) => void;
    onInteract: (npc: NPC) => void;
    onSpotted: () => void; // Jail Detection
    followingFriendId: string | null;
    playerPosition: Position;
    timeOfDay: number;
    vehicle: Vehicle | null;
    hasRoyalSystem: boolean; // Flag to enable detection logic
}

export const NPCSystem: React.FC<NPCSystemProps> = ({ npcs, onUpdate, onInteract, onSpotted, followingFriendId, playerPosition, timeOfDay, vehicle, hasRoyalSystem }) => {
  const group = useRef<THREE.Group>(null);
  const movementTargets = useRef<Map<string, THREE.Vector3>>(new Map());

  useFrame((state, delta) => {
    if (!group.current) return;
    
    // Faster speed to match player
    const speed = 10 * delta;
    
    const updatedNPCs = npcs.map(npc => {
        let target: THREE.Vector3;
        const currentPos = new THREE.Vector3(...npc.position);
        
        // --- JAIL DETECTION LOGIC ---
        // If has royal system, is driving, and NPC is human/visible
        if (hasRoyalSystem && vehicle && npc.type === 'HUMAN') {
             const playerVec = new THREE.Vector3(...playerPosition);
             const dist = new THREE.Vector2(currentPos.x, currentPos.z).distanceTo(new THREE.Vector2(playerVec.x, playerVec.z));
             
             // Detection radius approx 8 units
             if (dist < 8) {
                 onSpotted();
             }
        }

        // --- FOLLOWING LOGIC ---
        if (npc.id === followingFriendId) {
            // Target is player position (with offset)
            const playerVec = new THREE.Vector3(...playerPosition);
            const dist = currentPos.distanceTo(playerVec);
            
            if (dist > 3) {
                 target = playerVec;
            } else {
                 // Close enough, stop moving or idle
                 target = currentPos;
            }
        } else {
            // --- WANDERING LOGIC ---
            target = movementTargets.current.get(npc.id) || currentPos;
            
            if (currentPos.distanceTo(target) < 1.0) {
                // New Target within City Bounds
                target = new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    0,
                    (Math.random() - 0.5) * 80
                );
                movementTargets.current.set(npc.id, target);
            }
        }

        if (currentPos.distanceTo(target) > 0.1) {
             const direction = new THREE.Vector3().subVectors(target, currentPos).normalize();
             
             // Move
             const newPos = currentPos.add(direction.multiplyScalar(speed));
             
             // Rotate to face direction
             const targetRotation = Math.atan2(direction.x, direction.z);
             // Smooth rotation
             let rotDiff = targetRotation - npc.rotation;
             while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
             while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
             const newRotation = npc.rotation + rotDiff * 5 * delta;

             return {
                 ...npc,
                 position: [newPos.x, newPos.y, newPos.z] as Position,
                 rotation: newRotation
             };
        }
        
        return npc;
    });
    
    onUpdate(updatedNPCs);
  });

  return (
    <group ref={group}>
        {npcs.map(npc => {
            return (
                <group 
                    key={npc.id} 
                    position={new THREE.Vector3(...npc.position)} 
                    rotation={[0, npc.rotation, 0]}
                    onClick={(e) => {
                        e.stopPropagation();
                        onInteract(npc);
                    }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                    scale={npc.isShort ? [0.7, 0.7, 0.7] : [1, 1, 1]} // Scale down short NPCs
                >
                    {/* Visuals */}
                    {npc.type === 'HUMAN' && npc.appearance && (
                        <group scale={[0.8, 0.8, 0.8]}>
                            <PlayerAvatar appearance={npc.appearance} isWalking />
                            
                            {/* Carrying Props */}
                            {npc.carryingItem === 'BOX' && (
                                <mesh position={[0.3, 1.2, 0.4]} rotation={[0, 0, 0]}>
                                    <boxGeometry args={[0.5, 0.4, 0.5]} />
                                    <meshStandardMaterial color="#854d0e" />
                                </mesh>
                            )}
                            {npc.carryingItem === 'BAG' && (
                                <mesh position={[-0.3, 1.0, 0]} rotation={[0, 0, 0]}>
                                    <boxGeometry args={[0.2, 0.4, 0.3]} />
                                    <meshStandardMaterial color="#ffffff" />
                                    <mesh position={[0, 0.25, 0]}>
                                        <torusGeometry args={[0.1, 0.02, 8, 16]} />
                                        <meshStandardMaterial color="#333" />
                                    </mesh>
                                </mesh>
                            )}
                        </group>
                    )}

                    {npc.type === 'DOG' && npc.breed && (
                         <PetAvatar 
                            type="DOG" 
                            breed={npc.breed} 
                            accessories={{ hasClothing: false, hasShoes: false }} 
                        />
                    )}

                    {/* Friend Indicator */}
                    {npc.isFriend && (
                        <Html position={[0, 2.5, 0]} center>
                            <div className="bg-pink-500 text-white text-[10px] px-1 rounded-md font-bold shadow-sm whitespace-nowrap">
                                {npc.id === followingFriendId ? 'Following' : 'Friend'}
                            </div>
                        </Html>
                    )}
                    {!npc.isFriend && !npc.isShort && !npc.isPrisoner && (
                         <Html position={[0, 2.5, 0]} center>
                            <div className="bg-white/80 text-black text-[10px] px-1 rounded-md shadow-sm opacity-0 hover:opacity-100 transition-opacity">
                                Click to Add
                            </div>
                         </Html>
                    )}
                </group>
            );
        })}
    </group>
  );
};

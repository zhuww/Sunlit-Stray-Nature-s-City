
import React from 'react';
import * as THREE from 'three';
import { PlayerController } from '../Player/PlayerController';
import { PetFollower } from '../Player/PetFollower';
import { Pet, Position, Building, CharacterAppearance, NPC } from '../../types';
import { PlayerAvatar } from '../Player/PlayerAvatar';
import { PetAvatar } from '../Player/PetAvatar';
import { MessageSquare } from 'lucide-react';
import { Html } from '@react-three/drei';

interface FriendHouseSceneProps {
    friend: NPC | null;
    onExit: () => void;
    pets: Pet[];
    playerPosition: Position;
    onPositionChange: (pos: Position) => void;
    appearance: CharacterAppearance;
}

const woodMat = new THREE.MeshStandardMaterial({ color: '#8d6e63' }); 
const fabricMat = new THREE.MeshStandardMaterial({ color: '#60a5fa' }); // Blue for friends
const whiteMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });

export const FriendHouseScene: React.FC<FriendHouseSceneProps> = ({ friend, onExit, pets, playerPosition, onPositionChange, appearance }) => {
    
    // Spacious room
    const roomSize = 30;

    const [isChatting, setIsChatting] = React.useState(false);

    // Mock collision objects
    const collisionObjects: Building[] = [
        { id: "Sofa", type: 'HOUSE_L1', position: [0, 0, -6], rotation: 0 },
        { id: "Table", type: 'HOUSE_L1', position: [0, 0, 4], rotation: 0 },
    ] as any[];

    return (
        <group>
            {/* --- SPACIOUS ROOM SHELL --- */}
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[roomSize, roomSize]} />
                <meshStandardMaterial color="#e5e5e5" /> {/* Modern light floor */}
            </mesh>
            {/* Walls */}
            <mesh position={[0, 7.5, -roomSize/2]}>
                <boxGeometry args={[roomSize, 15, 1]} />
                <meshStandardMaterial color="#f0f9ff" />
            </mesh>
            <mesh position={[-roomSize/2, 7.5, 0]} rotation={[0, Math.PI/2, 0]}>
                <boxGeometry args={[roomSize, 15, 1]} />
                <meshStandardMaterial color="#f0f9ff" />
            </mesh>
            <mesh position={[roomSize/2, 7.5, 0]} rotation={[0, Math.PI/2, 0]}>
                <boxGeometry args={[roomSize, 15, 1]} />
                <meshStandardMaterial color="#f0f9ff" />
            </mesh>
             <mesh position={[0, 7.5, roomSize/2]}>
                <boxGeometry args={[roomSize, 15, 1]} />
                <meshStandardMaterial color="#f0f9ff" />
            </mesh>

            {/* --- LIGHTING --- */}
            <pointLight position={[0, 12, 0]} intensity={1.2} castShadow />

            {/* --- FURNITURE --- */}

            {/* Large Sofa */}
            <group position={[0, 1, -6]}>
                <mesh castShadow><boxGeometry args={[8, 1, 3]} /><primitive object={fabricMat} /></mesh>
                <mesh position={[0, 1, -1]}><boxGeometry args={[8, 1.5, 0.5]} /><primitive object={fabricMat} /></mesh>
                <mesh position={[-3.5, 0.5, 0]}><boxGeometry args={[1, 1, 3]} /><primitive object={fabricMat} /></mesh>
                <mesh position={[3.5, 0.5, 0]}><boxGeometry args={[1, 1, 3]} /><primitive object={fabricMat} /></mesh>
            </group>

            {/* Modern Coffee Table */}
            <group position={[0, 0.8, -2]}>
                 <mesh><boxGeometry args={[4, 0.2, 2]} /><meshStandardMaterial color="#1e293b" /></mesh>
                 <mesh position={[-1.8, -0.4, -0.8]}><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="black" /></mesh>
                 <mesh position={[1.8, -0.4, -0.8]}><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="black" /></mesh>
                 <mesh position={[-1.8, -0.4, 0.8]}><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="black" /></mesh>
                 <mesh position={[1.8, -0.4, 0.8]}><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="black" /></mesh>
            </group>

            {/* Art */}
            <mesh position={[0, 6, -14.4]}>
                <boxGeometry args={[6, 4, 0.1]} />
                <meshStandardMaterial color="#3b82f6" />
            </mesh>

            {/* --- THE FRIEND --- */}
            {friend && (
                <group 
                    position={[0, 1.8, -6]} 
                    rotation={[0, 0, 0]} 
                    onClick={() => setIsChatting(!isChatting)}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                    {friend.type === 'HUMAN' && friend.appearance ? (
                         // Sitting pose - simplified by rotation/position for now
                         <group rotation={[-0.2, 0, 0]}>
                            <PlayerAvatar appearance={friend.appearance} />
                         </group>
                    ) : (
                        <PetAvatar type="DOG" breed={friend.breed || 'GOLDEN'} accessories={{hasClothing:false, hasShoes:false}} />
                    )}

                    {/* Chat Bubble UI */}
                    {isChatting && (
                        <Html position={[0, 3, 0]} center>
                            <div className="bg-white p-4 rounded-2xl shadow-xl w-64 text-center border-2 border-blue-500 animate-in fade-in zoom-in">
                                <h3 className="font-bold text-blue-600 mb-1">{friend.name}</h3>
                                <p className="text-gray-700 italic">"Welcome to my place! It's so spacious here. Make yourself at home!"</p>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsChatting(false); }}
                                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
                                >
                                    Close
                                </button>
                            </div>
                        </Html>
                    )}
                    
                    {!isChatting && (
                        <Html position={[0, 3, 0]} center>
                             <div className="bg-white/80 p-2 rounded-full shadow-lg animate-bounce text-blue-500">
                                 <MessageSquare size={20} />
                             </div>
                        </Html>
                    )}
                </group>
            )}

            {/* --- DOOR (Exit) --- */}
            <group position={[0, 0, 14.5]} onClick={onExit} onPointerOver={() => document.body.style.cursor='pointer'} onPointerOut={() => document.body.style.cursor='auto'}>
                <mesh position={[0, 3, 0]}>
                    <boxGeometry args={[4, 6, 0.5]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[0, 3.5, 0.3]}>
                     <boxGeometry args={[3, 1, 0.1]} />
                     <meshStandardMaterial color="white" />
                </mesh>
            </group>

            {/* Player */}
            <PlayerController 
                buildings={collisionObjects}
                onPositionChange={onPositionChange}
                onInteract={() => {}}
                position={playerPosition}
                isWorking={false}
                boundary={14}
                appearance={appearance}
                vehicle={null}
            />

            {/* Pets */}
            {pets.map((pet, index) => (
                <PetFollower 
                    key={pet.id} 
                    pet={pet}
                    targetPosition={playerPosition} 
                    index={index}
                    onClick={() => {}}
                />
            ))}
        </group>
    );
};

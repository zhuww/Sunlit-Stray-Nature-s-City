

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Vehicle, CharacterAppearance } from '../../types';
import { Html } from '@react-three/drei';
import { LogOut } from 'lucide-react';
import { PlayerAvatar } from '../Player/PlayerAvatar';

interface MSStationSceneProps {
    onExit: () => void;
    onBuyVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
}

const PatrolCar: React.FC<{ 
    position: [number, number, number], 
    color?: string,
    label?: string,
    onSelect: () => void 
}> = ({ position, color = "#1f2937", label = "MS Patrol Unit", onSelect }) => (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={() => document.body.style.cursor='pointer'}
        onPointerOut={() => document.body.style.cursor='auto'}
    >
        {/* Car Mesh */}
        <mesh position={[0, 0.5, 0]} castShadow>
             <boxGeometry args={[2.2, 1.2, 4.2]} />
             <meshStandardMaterial color={color} />
        </mesh>
        {/* Top */}
        <mesh position={[0, 1.2, -0.5]}>
             <boxGeometry args={[2, 0.8, 2]} />
             <meshStandardMaterial color="#000" />
        </mesh>
        {/* Siren */}
        <mesh position={[0, 1.7, -0.5]}>
             <boxGeometry args={[0.8, 0.2, 0.2]} />
             <meshStandardMaterial color="blue" emissive="blue" emissiveIntensity={2} />
        </mesh>
        
        <Html position={[0, 2.5, 0]} center>
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full border border-white font-bold whitespace-nowrap text-xs shadow-lg animate-bounce">
                {label}
            </div>
        </Html>
    </group>
);

const IronCage: React.FC<{ position: [number, number, number], prisonerColor: string }> = ({ position, prisonerColor }) => {
    
    // Random prisoner appearance
    const prisonerLook: CharacterAppearance = {
        hairStyle: 'PONYTAIL', hairColor: '#333', skinColor: '#e0ac69', eyeColor: 'black', eyebrowStyle: 'FLAT', lipColor: '#e0ac69',
        topType: 'TSHIRT', topColor: prisonerColor, bottomType: 'PANTS_LONG', bottomColor: prisonerColor,
        sockColor: 'white', shoeColor: 'black', hasNecklace: false, hasEarrings: false, hasBracelets: false, hasRing: false
    };

    return (
        <group position={position}>
            {/* Cage Bars */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#333" wireframe />
            </mesh>
            <mesh position={[0.9, 1, 0.9]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="gray" /></mesh>
            <mesh position={[-0.9, 1, 0.9]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="gray" /></mesh>
            <mesh position={[0.9, 1, -0.9]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="gray" /></mesh>
            <mesh position={[-0.9, 1, -0.9]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="gray" /></mesh>

            {/* Prisoner Inside */}
            <group position={[0, 0, 0]}>
                <PlayerAvatar appearance={prisonerLook} />
            </group>
        </group>
    );
}

const BlueUniform: CharacterAppearance = {
    hairStyle: 'BOB', hairColor: '#000000', skinColor: '#ffdbac', eyeColor: 'black', eyebrowStyle: 'FLAT', lipColor: '#ffdbac',
    topType: 'JACKET', topColor: '#2563eb', bottomType: 'PANTS_LONG', bottomColor: '#1e40af',
    sockColor: 'black', shoeColor: 'black', hasNecklace: false, hasEarrings: false, hasBracelets: false, hasRing: false
};

const MovingGuard: React.FC<{ startPos: [number, number, number] }> = ({ startPos }) => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(group.current) {
            group.current.position.x = startPos[0] + Math.sin(state.clock.elapsedTime) * 2;
        }
    });

    return (
        <group ref={group} position={startPos}>
            <PlayerAvatar appearance={BlueUniform} isWalking />
        </group>
    )
}

export const MSStationScene: React.FC<MSStationSceneProps> = ({ onExit, onBuyVehicle }) => {
    return (
        <group>
            {/* Pink Empty Land Floor */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#fce7f3" />
            </mesh>
            
            {/* Walls */}
            <mesh position={[0, 5, -20]}><boxGeometry args={[40, 10, 1]} /><meshStandardMaterial color="#fbcfe8" /></mesh>
            <mesh position={[-20, 5, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[40, 10, 1]} /><meshStandardMaterial color="#fbcfe8" /></mesh>
            <mesh position={[20, 5, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[40, 10, 1]} /><meshStandardMaterial color="#fbcfe8" /></mesh>

            <pointLight position={[0, 15, 0]} intensity={1} color="white" />

            {/* --- CARS --- */}
            <PatrolCar position={[-5, 0, 0]} onSelect={() => onBuyVehicle({ style: 'SUV', color: '#1f2937', isMissionVehicle: true })} />
            <PatrolCar position={[5, 0, 0]} onSelect={() => onBuyVehicle({ style: 'SUV', color: '#1f2937', isMissionVehicle: true })} />

            {/* --- NEW PINK CARS --- */}
            <PatrolCar 
                position={[-12, 0, 5]} 
                color="#f472b6" 
                label="Special Unit"
                onSelect={() => onBuyVehicle({ style: 'SUV', color: '#f472b6', isMissionVehicle: true })} 
            />
            <PatrolCar 
                position={[12, 0, 5]} 
                color="#f472b6" 
                label="Special Unit"
                onSelect={() => onBuyVehicle({ style: 'SUV', color: '#f472b6', isMissionVehicle: true })} 
            />
             <PatrolCar 
                position={[0, 0, 10]} 
                color="#f472b6" 
                label="Special Unit"
                onSelect={() => onBuyVehicle({ style: 'SUV', color: '#f472b6', isMissionVehicle: true })} 
            />

            {/* --- IRON CAGES --- */}
            <IronCage position={[-10, 0, -10]} prisonerColor="orange" />
            <IronCage position={[0, 0, -10]} prisonerColor="green" />
            <IronCage position={[10, 0, -10]} prisonerColor="red" />
            
            {/* --- MOVING GUARDS --- */}
            <MovingGuard startPos={[-8, 0, 5]} />
            <MovingGuard startPos={[8, 0, 5]} />
            <MovingGuard startPos={[0, 0, 8]} />

            {/* Overlay Text */}
            <Html position={[0, 5, -5]} center>
                <div className="bg-black/50 text-white p-4 rounded-xl backdrop-blur-md text-center">
                    <h2 className="text-2xl font-bold text-pink-300">MS STATION</h2>
                    <p className="text-sm">Patrol the night. Find the prisoners in black.</p>
                    <p className="text-xs text-gray-300 mt-1">Reward: 200 Units per capture.</p>
                </div>
            </Html>

            {/* Exit Button */}
            <Html position={[0, -2, 15]} center>
                <button 
                    onClick={onExit}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg border border-gray-500"
                >
                    <LogOut size={20} /> Exit Station
                </button>
            </Html>
        </group>
    );
};

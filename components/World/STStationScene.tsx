
import React from 'react';
import * as THREE from 'three';
import { Vehicle, CharacterAppearance } from '../../types';
import { Html } from '@react-three/drei';
import { LogOut } from 'lucide-react';
import { PlayerAvatar } from '../Player/PlayerAvatar';

interface STStationSceneProps {
    onExit: () => void;
    onBuyVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
    money: number;
}

const MissionVehicle: React.FC<{ 
    position: [number, number, number], 
    color: string, 
    onSelect: () => void 
}> = ({ position, color, onSelect }) => (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={() => document.body.style.cursor='pointer'}
        onPointerOut={() => document.body.style.cursor='auto'}
    >
        {/* Car Mesh */}
        <mesh position={[0, 0.5, 0]} castShadow>
             <boxGeometry args={[2, 1, 4]} />
             <meshStandardMaterial color={color} />
        </mesh>
        {/* Top */}
        <mesh position={[0, 1.2, -0.5]}>
             <boxGeometry args={[1.8, 0.8, 2]} />
             <meshStandardMaterial color="#111" />
        </mesh>
        {/* Siren */}
        <mesh position={[0, 1.6, -0.5]}>
             <boxGeometry args={[0.8, 0.2, 0.2]} />
             <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
        </mesh>
        
        <Html position={[0, 2.5, 0]} center>
            <div className="bg-pink-600 text-white px-3 py-1 rounded-full border border-white font-bold whitespace-nowrap text-xs shadow-lg animate-bounce">
                Patrol Car
            </div>
        </Html>
    </group>
);

const IronRack: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        {/* Shelves */}
        <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[3, 0.1, 1]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0, 1.5, 0]} castShadow><boxGeometry args={[3, 0.1, 1]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[3, 0.1, 1]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} /></mesh>
        {/* Posts */}
        <mesh position={[-1.4, 1.25, 0.4]}><boxGeometry args={[0.1, 2.5, 0.1]} /><meshStandardMaterial color="#64748b" /></mesh>
        <mesh position={[1.4, 1.25, 0.4]}><boxGeometry args={[0.1, 2.5, 0.1]} /><meshStandardMaterial color="#64748b" /></mesh>
        <mesh position={[-1.4, 1.25, -0.4]}><boxGeometry args={[0.1, 2.5, 0.1]} /><meshStandardMaterial color="#64748b" /></mesh>
        <mesh position={[1.4, 1.25, -0.4]}><boxGeometry args={[0.1, 2.5, 0.1]} /><meshStandardMaterial color="#64748b" /></mesh>
    </group>
);

const BlueUniform: CharacterAppearance = {
    hairStyle: 'BOB', hairColor: '#000000', skinColor: '#ffdbac', eyeColor: 'black', eyebrowStyle: 'FLAT', lipColor: '#ffdbac',
    topType: 'JACKET', topColor: '#2563eb', bottomType: 'PANTS_LONG', bottomColor: '#1e40af',
    sockColor: 'black', shoeColor: 'black', hasNecklace: false, hasEarrings: false, hasBracelets: false, hasRing: false
};

const PurpleUniform: CharacterAppearance = {
    hairStyle: 'LONG', hairColor: '#3f2c2c', skinColor: '#e0ac69', eyeColor: 'brown', eyebrowStyle: 'ARCHED', lipColor: '#db2777',
    topType: 'TSHIRT', topColor: '#9333ea', bottomType: 'SKIRT', bottomColor: '#7e22ce',
    sockColor: 'white', shoeColor: 'black', hasNecklace: true, hasEarrings: true, hasBracelets: true, hasRing: true
};

export const STStationScene: React.FC<STStationSceneProps> = ({ onExit, onBuyVehicle, money }) => {
    
    // Generate 8 NPCs
    const blueTeam = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        position: [ -8 + (i % 4) * 2, 0, 8 + Math.floor(i / 4) * 2] as [number, number, number]
    }));

    return (
        <group>
            {/* Gray Parking Garage Interior */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#9ca3af" roughness={0.5} />
            </mesh>
            
            {/* Walls */}
            <mesh position={[0, 5, -20]}><boxGeometry args={[40, 10, 1]} /><meshStandardMaterial color="#6b7280" /></mesh>
            <mesh position={[-20, 5, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[40, 10, 1]} /><meshStandardMaterial color="#6b7280" /></mesh>
            <mesh position={[20, 5, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[40, 10, 1]} /><meshStandardMaterial color="#6b7280" /></mesh>

            {/* Lights - Industrial Fluorescent Feel */}
            <pointLight position={[0, 15, 0]} intensity={1.5} distance={40} color="white" />
            <pointLight position={[-10, 15, -10]} intensity={1} distance={30} color="white" />
            <pointLight position={[10, 15, 10]} intensity={1} distance={30} color="white" />

            {/* --- PINK CARS FLEET --- */}
            {[-10, -5, 0, 5, 10].map((x, i) => (
                <MissionVehicle 
                    key={i}
                    position={[x, 0, -5]} 
                    color="#f472b6" 
                    onSelect={() => onBuyVehicle({ style: 'SEDAN', color: '#f472b6', isMissionVehicle: true })} 
                />
            ))}

            {/* --- IRON RACKS --- */}
            <IronRack position={[-15, 0, -10]} />
            <IronRack position={[-15, 0, 0]} />
            <IronRack position={[-15, 0, 10]} />

            {/* --- BLUE TEAM (Queuing & Bowing) --- */}
            {blueTeam.map((npc) => (
                <group key={npc.id} position={npc.position} rotation={[0.2, 0, 0]}> {/* Slight X rotation for bow */}
                    <PlayerAvatar appearance={BlueUniform} />
                </group>
            ))}

            {/* --- CONTROL DESK --- */}
            <group position={[12, 0, 5]} rotation={[0, -Math.PI/2, 0]}>
                {/* Desk */}
                <mesh position={[0, 1, 0]}>
                    <boxGeometry args={[4, 1.5, 1.5]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
                {/* Monitors */}
                <mesh position={[0, 2, 0.4]}>
                    <boxGeometry args={[3, 1, 0.1]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[0, 2, 0.45]}>
                    <planeGeometry args={[2.8, 0.8]} />
                    <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
                </mesh>
                
                {/* Purple Skirt Lady */}
                <group position={[0, 0.8, -1.5]}>
                    <PlayerAvatar appearance={PurpleUniform} />
                </group>
            </group>

            {/* Overlay Text */}
            <Html position={[0, 5, -10]} center>
                <div className="bg-black/50 text-white p-4 rounded-xl backdrop-blur-md text-center">
                    <h2 className="text-2xl font-bold text-pink-300">ST PATROL DIVISION</h2>
                    <p className="text-sm">Select a vehicle to begin your night shift.</p>
                    <p className="text-xs text-gray-300 mt-1">Reward: 80 Units per captured target.</p>
                </div>
            </Html>

            {/* Exit Button */}
            <Html position={[0, -2, 15]} center>
                <button 
                    onClick={onExit}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg border border-gray-500"
                >
                    <LogOut size={20} /> Exit Garage
                </button>
            </Html>
        </group>
    );
};

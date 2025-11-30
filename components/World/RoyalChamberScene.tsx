
import React, { useState } from 'react';
import * as THREE from 'three';
import { PlayerController } from '../Player/PlayerController';
import { CharacterAppearance } from '../../types';
import { PlayerAvatar } from '../Player/PlayerAvatar';
import { Html } from '@react-three/drei';
import { LogOut, Crown } from 'lucide-react';

interface RoyalChamberSceneProps {
    onExit: () => void;
    onGetSystem: () => void;
    hasSystem: boolean;
    appearance: CharacterAppearance;
}

const ServantAppearance: CharacterAppearance = {
    hairStyle: 'PONYTAIL', hairColor: '#e0ac69', skinColor: '#ffdbac', eyeColor: 'brown', eyebrowStyle: 'ROUND', lipColor: '#ffdbac',
    topType: 'JACKET', topColor: '#b91c1c', bottomType: 'PANTS_LONG', bottomColor: '#000',
    sockColor: 'white', shoeColor: 'black', hasNecklace: false, hasEarrings: false, hasBracelets: false, hasRing: false
};

const QuestGiverAppearance: CharacterAppearance = {
    hairStyle: 'LONG', hairColor: '#ffffff', skinColor: '#e0ac69', eyeColor: 'blue', eyebrowStyle: 'ARCHED', lipColor: '#e0ac69',
    topType: 'JACKET', topColor: '#ffd700', bottomType: 'SKIRT', bottomColor: '#ffffff',
    sockColor: 'white', shoeColor: 'gold', hasNecklace: true, hasEarrings: true, hasBracelets: true, hasRing: true
};

export const RoyalChamberScene: React.FC<RoyalChamberSceneProps> = ({ onExit, onGetSystem, hasSystem, appearance }) => {
    
    const [peopleDismissed, setPeopleDismissed] = useState(false);
    const [questGiverVisible, setQuestGiverVisible] = useState(false);
    const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 8]);

    const handleDismiss = () => {
        setPeopleDismissed(true);
    };

    const handleBedInteract = () => {
        if (!peopleDismissed) return;
        if (!hasSystem) {
            setQuestGiverVisible(true);
        }
    };

    const handleAcceptQuest = () => {
        onGetSystem();
        setQuestGiverVisible(false); // Disappear after giving
    };

    return (
        <group>
            {/* Elegant Room */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#581c87" /> {/* Royal Purple Floor */}
            </mesh>
            
            {/* Walls */}
            <mesh position={[0, 5, -10]}><boxGeometry args={[20, 10, 1]} /><meshStandardMaterial color="#fbcfe8" /></mesh>
            <mesh position={[-10, 5, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[20, 10, 1]} /><meshStandardMaterial color="#fbcfe8" /></mesh>
            <mesh position={[10, 5, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[20, 10, 1]} /><meshStandardMaterial color="#fbcfe8" /></mesh>

            <pointLight position={[0, 8, 0]} intensity={1.5} color="gold" />

            {/* --- The Bed --- */}
            <group 
                position={[0, 0.5, -6]} 
                onClick={(e) => { e.stopPropagation(); handleBedInteract(); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                {/* Bed Frame */}
                <mesh castShadow><boxGeometry args={[4, 1, 5]} /><meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} /></mesh>
                {/* Mattress */}
                <mesh position={[0, 0.6, 0]}><boxGeometry args={[3.8, 0.4, 4.8]} /><meshStandardMaterial color="white" /></mesh>
                {/* Pillow */}
                <mesh position={[0, 1, -2]}><boxGeometry args={[3, 0.3, 1]} /><meshStandardMaterial color="red" /></mesh>
                
                {peopleDismissed && (
                     <Html position={[0, 3, 0]} center>
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold animate-bounce">
                             {hasSystem ? "King's Bed (System Active)" : "King's Bed (Interact)"}
                        </div>
                     </Html>
                )}
            </group>

            {/* --- Servants (Dismissable) --- */}
            {!peopleDismissed && (
                <group>
                    <group position={[-3, 0, 0]}><PlayerAvatar appearance={ServantAppearance} /></group>
                    <group position={[3, 0, 0]}><PlayerAvatar appearance={ServantAppearance} /></group>
                    <group position={[-3, 0, -2]}><PlayerAvatar appearance={ServantAppearance} /></group>
                    
                    <Html position={[0, 2, 2]} center>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg"
                        >
                            Dismiss Servants
                        </button>
                    </Html>
                </group>
            )}

            {/* --- Quest Giver --- */}
            {questGiverVisible && (
                <group position={[0, 0, -3]}>
                    <PlayerAvatar appearance={QuestGiverAppearance} />
                    <Html position={[0, 4, 0]} center>
                        <div className="bg-white p-4 rounded-xl shadow-2xl text-center w-64 border-4 border-yellow-400">
                             <Crown className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                             <h3 className="font-bold text-lg mb-2">Royal System</h3>
                             <p className="text-sm text-gray-700 mb-4">"I grant you the Golden Carriage System. Do not let the commoners catch you driving!"</p>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleAcceptQuest(); }}
                                className="bg-yellow-500 hover:bg-yellow-400 text-white w-full py-2 rounded-lg font-bold"
                             >
                                 Accept System
                             </button>
                        </div>
                    </Html>
                </group>
            )}

            {/* Exit Button */}
            <Html position={[0, -2, 12]} center>
                <button 
                    onClick={onExit}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg border border-gray-500"
                >
                    <LogOut size={20} /> Exit Chamber
                </button>
            </Html>

            {/* Player */}
            <PlayerController 
                buildings={[]}
                onPositionChange={setPlayerPosition}
                onInteract={() => {}}
                position={playerPosition}
                isWorking={false}
                appearance={appearance}
                vehicle={null}
            />
        </group>
    );
};

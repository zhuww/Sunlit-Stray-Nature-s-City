
import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { PetType, PetAccessories, CatBreed, DogBreed, BirdBreed, PET_PRICES } from '../../types';
import { PetAvatar } from '../Player/PetAvatar';
import { Check, X } from 'lucide-react';

interface PetAdoptionModalProps {
    type: PetType;
    onClose: () => void;
    onAdopt: (breed: string, accessories: PetAccessories) => void;
    price: number;
}

const RotatingPet: React.FC<{ type: PetType, breed: string, accessories: PetAccessories }> = ({ type, breed, accessories }) => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
        }
    });
    return (
        <group ref={group} scale={[2, 2, 2]} position={[0, -0.5, 0]}>
            <PetAvatar type={type} breed={breed} accessories={accessories} />
        </group>
    );
};

export const PetAdoptionModal: React.FC<PetAdoptionModalProps> = ({ type, onClose, onAdopt, price }) => {
    
    // --- Configuration Constants ---
    const catBreeds: CatBreed[] = ['WHITE', 'BLACK', 'SIAMESE', 'CALICO', 'ORANGE', 'GRAY', 'TUXEDO', 'PERSIAN'];
    const dogBreeds: DogBreed[] = ['GOLDEN', 'PUG', 'HUSKY', 'DALMATIAN', 'BEAGLE', 'POODLE', 'SHEPHERD', 'BULLDOG'];
    const birdBreeds: BirdBreed[] = ['BLUE_JAY', 'CARDINAL', 'CANARY', 'PARROT'];

    const availableBreeds = type === 'CAT' ? catBreeds : type === 'DOG' ? dogBreeds : birdBreeds;

    // --- State ---
    const [selectedBreed, setSelectedBreed] = useState<string>(availableBreeds[0]);
    const [accessories, setAccessories] = useState<PetAccessories>({
        hasClothing: false,
        clothingColor: '#ec4899',
        hasShoes: false,
        shoeColor: '#3b82f6',
        collarColor: undefined
    });

    const canWearShoes = type !== 'BIRD';

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-[900px] h-[600px] shadow-2xl overflow-hidden flex flex-row">
                
                {/* --- Left: 3D Preview --- */}
                <div className="w-1/2 bg-slate-100 relative">
                     <Canvas shadows camera={{ position: [0, 1, 4], fov: 45 }}>
                        <Sky sunPosition={[10, 50, 10]} />
                        <ambientLight intensity={0.7} />
                        <directionalLight position={[2, 5, 5]} intensity={1.2} castShadow />
                        <ContactShadows resolution={512} scale={10} blur={1} opacity={0.5} far={10} />
                        
                        <RotatingPet type={type} breed={selectedBreed} accessories={accessories} />
                        <OrbitControls enableZoom={false} enablePan={false} />
                    </Canvas>
                    <div className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-slate-700">
                        Price: {price} Units
                    </div>
                </div>

                {/* --- Right: Controls --- */}
                <div className="w-1/2 p-6 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Adopt a {type.toLowerCase()}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Breed Selection */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Select Breed</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {availableBreeds.map(breed => (
                                <button
                                    key={breed}
                                    onClick={() => setSelectedBreed(breed)}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border-2 transition-all p-1 text-center ${
                                        selectedBreed === breed 
                                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-pink-200'
                                    }`}
                                >
                                    {breed.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accessories */}
                    <div className="mb-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Accessories</h3>

                        {/* Collar */}
                        <div>
                             <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                                 <input 
                                    type="checkbox" 
                                    checked={!!accessories.collarColor} 
                                    onChange={(e) => setAccessories(p => ({...p, collarColor: e.target.checked ? '#ef4444' : undefined }))}
                                 />
                                 Wear Collar
                             </label>
                             {accessories.collarColor && (
                                 <div className="flex gap-2">
                                     {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#000000'].map(c => (
                                         <button 
                                            key={c} onClick={() => setAccessories(p => ({...p, collarColor: c}))}
                                            className={`w-6 h-6 rounded-full border ${accessories.collarColor === c ? 'scale-110 border-black' : 'border-gray-200'}`}
                                            style={{ backgroundColor: c }}
                                         />
                                     ))}
                                 </div>
                             )}
                        </div>

                        {/* Clothing */}
                        <div>
                             <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                                 <input 
                                    type="checkbox" 
                                    checked={accessories.hasClothing} 
                                    onChange={(e) => setAccessories(p => ({...p, hasClothing: e.target.checked }))}
                                 />
                                 Wear Clothing
                             </label>
                             {accessories.hasClothing && (
                                 <div className="flex gap-2">
                                     {['#ec4899', '#3b82f6', '#8b5cf6', '#fca5a5', '#ffffff'].map(c => (
                                         <button 
                                            key={c} onClick={() => setAccessories(p => ({...p, clothingColor: c}))}
                                            className={`w-6 h-6 rounded-full border ${accessories.clothingColor === c ? 'scale-110 border-black' : 'border-gray-200'}`}
                                            style={{ backgroundColor: c }}
                                         />
                                     ))}
                                 </div>
                             )}
                        </div>

                        {/* Shoes (Cats/Dogs only) */}
                        {canWearShoes && (
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                                    <input 
                                        type="checkbox" 
                                        checked={accessories.hasShoes} 
                                        onChange={(e) => setAccessories(p => ({...p, hasShoes: e.target.checked }))}
                                    />
                                    Wear Shoes
                                </label>
                                {accessories.hasShoes && (
                                    <div className="flex gap-2">
                                        {['#1f2937', '#ef4444', '#3b82f6', '#ffffff'].map(c => (
                                            <button 
                                                key={c} onClick={() => setAccessories(p => ({...p, shoeColor: c}))}
                                                className={`w-6 h-6 rounded-full border ${accessories.shoeColor === c ? 'scale-110 border-black' : 'border-gray-200'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-auto">
                        <button 
                            onClick={() => onAdopt(selectedBreed, accessories)}
                            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
                        >
                            <Check className="w-6 h-6" /> 
                            Adopt for {price} Units
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

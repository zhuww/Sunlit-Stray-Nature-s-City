

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Vehicle, CarStyle } from '../../types';
import { Check, X } from 'lucide-react';

interface CarRentalModalProps {
    onClose: () => void;
    onRent: (vehicle: Omit<Vehicle, 'id'>) => void;
}

const CarMesh: React.FC<{ style: CarStyle, color: string }> = ({ style, color }) => {
    return (
        <group>
            {/* Chassis */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[2, 1, 4]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Cabin */}
            {style === 'SEDAN' && (
                <mesh position={[0, 1.2, -0.2]}>
                     <boxGeometry args={[1.8, 0.8, 2]} />
                     <meshStandardMaterial color="#333" />
                </mesh>
            )}
            {style === 'SUV' && (
                <mesh position={[0, 1.3, 0]}>
                     <boxGeometry args={[1.9, 1.0, 3]} />
                     <meshStandardMaterial color="#333" />
                </mesh>
            )}
            {style === 'SPORTS' && (
                 <mesh position={[0, 1.0, -0.5]}>
                    <boxGeometry args={[1.8, 0.6, 1.5]} />
                    <meshStandardMaterial color="#333" />
                 </mesh>
            )}
             {style === 'SPORTS' && (
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
        </group>
    )
}

const RotatingCar: React.FC<{ style: CarStyle, color: string }> = ({ style, color }) => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
        }
    });
    return (
        <group ref={group} scale={[1, 1, 1]} position={[0, -0.5, 0]}>
            <CarMesh style={style} color={color} />
        </group>
    );
};

export const CarRentalModal: React.FC<CarRentalModalProps> = ({ onClose, onRent }) => {
    
    const styles: CarStyle[] = ['SEDAN', 'SUV', 'SPORTS'];
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#000000', '#ffffff', '#8b5cf6'];

    const [selectedStyle, setSelectedStyle] = useState<CarStyle>('SEDAN');
    const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-[900px] h-[600px] shadow-2xl overflow-hidden flex flex-row">
                
                {/* --- Left: 3D Preview --- */}
                <div className="w-1/2 bg-slate-100 relative">
                     <Canvas shadows camera={{ position: [4, 3, 4], fov: 45 }}>
                        <Sky sunPosition={[10, 50, 10]} />
                        <ambientLight intensity={0.7} />
                        <directionalLight position={[2, 5, 5]} intensity={1.2} castShadow />
                        <ContactShadows resolution={512} scale={10} blur={1} opacity={0.5} far={10} />
                        
                        <RotatingCar style={selectedStyle} color={selectedColor} />
                        <OrbitControls enableZoom={false} enablePan={false} />
                    </Canvas>
                    <div className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-slate-700">
                        Rental Cost: 50 Units
                    </div>
                </div>

                {/* --- Right: Controls --- */}
                <div className="w-1/2 p-6 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Rent a Car</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Style Selection */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Select Style</h3>
                        <div className="flex gap-2">
                            {styles.map(style => (
                                <button
                                    key={style}
                                    onClick={() => setSelectedStyle(style)}
                                    className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                                        selectedStyle === style 
                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
                                    }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Select Color</h3>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 ${
                                        selectedColor === color 
                                        ? 'border-blue-500 scale-110 shadow-md' 
                                        : 'border-gray-200'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button 
                            onClick={() => onRent({ style: selectedStyle, color: selectedColor })}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
                        >
                            <Check className="w-6 h-6" /> 
                            Confirm Rental
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
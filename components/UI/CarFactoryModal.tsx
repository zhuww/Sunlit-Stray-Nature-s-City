

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Vehicle, CarStyle } from '../../types';
import { Check, X, Wrench } from 'lucide-react';

interface CarFactoryModalProps {
    onClose: () => void;
    onBuild: (vehicle: Omit<Vehicle, 'id'>) => void;
    partsAvailable: number;
}

const CarMesh: React.FC<{ style: CarStyle, color: string, engine: string, wheels: string }> = ({ style, color, engine, wheels }) => {
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

            {/* Wheels based on type */}
            {[{x: 1, z: 1.2}, {x: -1, z: 1.2}, {x: 1, z: -1.2}, {x: -1, z: -1.2}].map((pos, i) => (
                <mesh key={i} position={[pos.x, 0.4, pos.z]} rotation={[0, 0, Math.PI/2]}>
                     <cylinderGeometry args={[wheels === 'OFFROAD' ? 0.6 : 0.4, wheels === 'OFFROAD' ? 0.6 : 0.4, 0.3, 16]} />
                     <meshStandardMaterial color="#1f2937" />
                     {wheels === 'RACING' && (
                         <mesh position={[0, 0.16, 0]}>
                             <cylinderGeometry args={[0.2, 0.2, 0.02, 8]} />
                             <meshStandardMaterial color="gold" />
                         </mesh>
                     )}
                </mesh>
            ))}

            {/* Engine Visual (Hood Scoop) */}
            {engine === 'V8' && (
                <mesh position={[0, 1.05, 1.2]}>
                     <boxGeometry args={[1, 0.2, 1]} />
                     <meshStandardMaterial color="#111" />
                </mesh>
            )}
        </group>
    )
}

const RotatingCar: React.FC<{ style: CarStyle, color: string, engine: string, wheels: string }> = ({ style, color, engine, wheels }) => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
        }
    });
    return (
        <group ref={group} scale={[1, 1, 1]} position={[0, -0.5, 0]}>
            <CarMesh style={style} color={color} engine={engine} wheels={wheels} />
        </group>
    );
};

export const CarFactoryModal: React.FC<CarFactoryModalProps> = ({ onClose, onBuild, partsAvailable }) => {
    
    const styles: CarStyle[] = ['SEDAN', 'SUV', 'SPORTS'];
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#000000', '#ffffff', '#8b5cf6'];
    const engines = ['V6', 'V8', 'ELECTRIC'];
    const wheels = ['STANDARD', 'RACING', 'OFFROAD'];

    const [selectedStyle, setSelectedStyle] = useState<CarStyle>('SEDAN');
    const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');
    const [selectedEngine, setSelectedEngine] = useState<string>('V6');
    const [selectedWheels, setSelectedWheels] = useState<string>('STANDARD');

    const BUILD_COST = 80;
    const canAfford = partsAvailable >= BUILD_COST;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-[900px] h-[650px] shadow-2xl overflow-hidden flex flex-row">
                
                {/* --- Left: 3D Preview --- */}
                <div className="w-1/2 bg-slate-100 relative">
                     <Canvas shadows camera={{ position: [4, 3, 4], fov: 45 }}>
                        <Sky sunPosition={[10, 50, 10]} />
                        <ambientLight intensity={0.7} />
                        <directionalLight position={[2, 5, 5]} intensity={1.2} castShadow />
                        <ContactShadows resolution={512} scale={10} blur={1} opacity={0.5} far={10} />
                        
                        <RotatingCar style={selectedStyle} color={selectedColor} engine={selectedEngine} wheels={selectedWheels} />
                        <OrbitControls enableZoom={false} enablePan={false} />
                    </Canvas>
                    <div className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-slate-700 flex flex-col">
                        <span>Factory Assembly</span>
                        <span className={canAfford ? "text-green-600" : "text-red-600"}>
                            Cost: {BUILD_COST} Parts (You have: {partsAvailable})
                        </span>
                    </div>
                </div>

                {/* --- Right: Controls --- */}
                <div className="w-1/2 p-6 flex flex-col overflow-y-auto bg-slate-50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                             <Wrench className="w-8 h-8 text-purple-600" />
                             <h2 className="text-2xl font-bold text-slate-800">Car Factory</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Style Selection */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Chassis Style</h3>
                            <div className="flex gap-2">
                                {styles.map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                                            selectedStyle === style 
                                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200'
                                        }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Engine Selection */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Engine Unit</h3>
                            <div className="flex gap-2">
                                {engines.map(eng => (
                                    <button
                                        key={eng}
                                        onClick={() => setSelectedEngine(eng)}
                                        className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                                            selectedEngine === eng 
                                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200'
                                        }`}
                                    >
                                        {eng}
                                    </button>
                                ))}
                            </div>
                        </div>

                         {/* Wheels Selection */}
                         <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Wheel Set</h3>
                            <div className="flex gap-2">
                                {wheels.map(w => (
                                    <button
                                        key={w}
                                        onClick={() => setSelectedWheels(w)}
                                        className={`px-4 py-2 rounded-lg font-bold border-2 transition-all ${
                                            selectedWheels === w 
                                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200'
                                        }`}
                                    >
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Paint Job</h3>
                            <div className="flex flex-wrap gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-10 h-10 rounded-full border-2 ${
                                            selectedColor === color 
                                            ? 'border-purple-500 scale-110 shadow-md' 
                                            : 'border-gray-200'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            disabled={!canAfford}
                            onClick={() => onBuild({ style: selectedStyle, color: selectedColor })}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform ${
                                canAfford 
                                ? 'bg-purple-600 hover:bg-purple-500 text-white hover:scale-105' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <Wrench className="w-6 h-6" /> 
                            {canAfford ? 'Build Vehicle' : 'Need more parts'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
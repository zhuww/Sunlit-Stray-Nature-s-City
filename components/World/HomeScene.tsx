
import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { PlayerController } from '../Player/PlayerController';
import { PetFollower } from '../Player/PetFollower';
import { Pet, Position, Building, CharacterAppearance } from '../../types';
import { ShoppingBag, X, Check } from 'lucide-react';
import { Html } from '@react-three/drei';

interface HomeSceneProps {
    onExit: () => void;
    onSleep: () => void;
    pets: Pet[];
    playerPosition: Position;
    onPositionChange: (pos: Position) => void;
    onMessage: (msg: string) => void;
    appearance: CharacterAppearance;
    onPetClick: (id: string) => void;
    ownedFurniture: string[];
    onBuyFurniture: (id: string, price: number) => void;
    money: number;
}

// Reusable furniture material
const woodMat = new THREE.MeshStandardMaterial({ color: '#8d6e63' }); // Brown
const metalMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8, roughness: 0.2 }); // Silver
const whiteMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
const fabricMat = new THREE.MeshStandardMaterial({ color: '#f87171' }); // Reddish
const childFabricMat = new THREE.MeshStandardMaterial({ color: '#f9a8d4' }); // Pink
const glassMat = new THREE.MeshStandardMaterial({ color: '#a5f3fc', transparent: true, opacity: 0.6 });

const FurnitureItem: React.FC<{ 
    position: [number, number, number], 
    rotation?: [number, number, number], 
    name: string, 
    onClick?: () => void,
    children: React.ReactNode 
}> = ({ position, rotation = [0, 0, 0], name, onClick, children }) => (
    <group 
        position={position} 
        rotation={rotation} 
        onClick={(e) => {
            if (onClick) {
                e.stopPropagation();
                onClick();
            }
        }}
        onPointerOver={() => onClick && (document.body.style.cursor = 'pointer')}
        onPointerOut={() => onClick && (document.body.style.cursor = 'auto')}
    >
        {children}
    </group>
);

const FURNITURE_CATALOG = [
    { id: "Master Bed", price: 120, category: "Bedroom" },
    { id: "Child Bed", price: 60, category: "Bedroom" },
    { id: "Bedside Table", price: 30, category: "Bedroom" },
    { id: "Pet Bed", price: 25, category: "Living" },
    { id: "Wardrobe", price: 80, category: "Bedroom" },
    { id: "Rug", price: 40, category: "Living" },
    { id: "Sofa", price: 100, category: "Living" },
    { id: "TV", price: 150, category: "Living" },
    { id: "Table", price: 70, category: "Dining" },
    { id: "Plant", price: 20, category: "Decor" },
    { id: "Bookshelf", price: 60, category: "Living" },
    { id: "Lamp", price: 25, category: "Decor" },
    { id: "Sink", price: 90, category: "Kitchen" },
    { id: "Stove", price: 110, category: "Kitchen" },
    { id: "Fridge", price: 130, category: "Kitchen" },
    { id: "Microwave", price: 50, category: "Kitchen" },
    { id: "Trash Can", price: 15, category: "Kitchen" },
    { id: "Desk", price: 75, category: "Office" },
    { id: "Chair", price: 30, category: "Office" },
    { id: "Computer", price: 200, category: "Office" },
    { id: "Shower", price: 120, category: "Bathroom" },
    { id: "Toilet", price: 80, category: "Bathroom" },
    { id: "Mirror", price: 40, category: "Bathroom" },
];

export const HomeScene: React.FC<HomeSceneProps> = ({ onExit, onSleep, pets, playerPosition, onPositionChange, onMessage, appearance, onPetClick, ownedFurniture, onBuyFurniture, money }) => {
    
    const [isShopOpen, setIsShopOpen] = useState(false);

    // Filter collision objects based on what is built
    const collisionObjects = useMemo(() => {
        const potentialItems: Building[] = [
            { id: "Master Bed", type: 'HOUSE_L1', position: [-8, 0, -8], rotation: 0 },
            { id: "Child Bed", type: 'HOUSE_L1', position: [-11, 0, -3], rotation: 0 },
            { id: "Sofa", type: 'HOUSE_L1', position: [0, 0, -4], rotation: 0 },
            { id: "Table", type: 'HOUSE_L1', position: [0, 0, -1], rotation: 0 },
            { id: "TV", type: 'HOUSE_L1', position: [0, 0, 4], rotation: 0 },
            { id: "Fridge", type: 'HOUSE_L1', position: [10, 0, -5], rotation: 0 },
            { id: "Desk", type: 'HOUSE_L1', position: [-10, 0, 8], rotation: 0 },
            { id: "Pet Bed", type: 'HOUSE_L1', position: [-4, 0, -8], rotation: 0 },
            { id: "Bedside Table", type: 'HOUSE_L1', position: [-5.5, 0, -8], rotation: 0 },
        ] as any[];
        
        // Only include collision for items that exist
        return potentialItems.filter(item => ownedFurniture.includes(item.id));
    }, [ownedFurniture]);

    const isOwned = (id: string) => ownedFurniture.includes(id);

    return (
        <group>
            {/* --- HTML UI FOR FURNITURE SHOP --- */}
            <Html fullscreen>
                <div className="absolute top-4 right-4 pointer-events-auto z-50">
                    <button 
                        onClick={() => setIsShopOpen(!isShopOpen)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
                    >
                        <ShoppingBag className="w-6 h-6" />
                        {isShopOpen ? 'Close Catalog' : 'Build House'}
                    </button>
                </div>

                {isShopOpen && (
                    <div className="absolute top-20 right-4 w-80 bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto pointer-events-auto border-2 border-yellow-500">
                        <div className="p-4 bg-yellow-100 border-b border-yellow-200">
                            <h2 className="font-bold text-yellow-800 text-lg">Furniture Catalog</h2>
                            <p className="text-sm text-yellow-600">You have {money} Coins</p>
                        </div>
                        <div className="p-2 space-y-2">
                            {FURNITURE_CATALOG.map(item => {
                                const owned = isOwned(item.id);
                                const canAfford = money >= item.price;
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div>
                                            <div className="font-bold text-slate-700">{item.id}</div>
                                            <div className="text-xs text-slate-400">{item.category}</div>
                                        </div>
                                        {owned ? (
                                            <span className="text-green-500 flex items-center gap-1 text-sm font-bold">
                                                <Check size={16} /> Owned
                                            </span>
                                        ) : (
                                            <button 
                                                disabled={!canAfford}
                                                onClick={() => onBuyFurniture(item.id, item.price)}
                                                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                                                    canAfford 
                                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {item.price}c
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </Html>

            {/* --- ROOM SHELL --- */}
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[25, 25]} />
                <meshStandardMaterial color="#fde047" /> {/* Warm yellow floor */}
            </mesh>
            {/* Walls */}
            <mesh position={[0, 5, -12.5]}>
                <boxGeometry args={[25, 10, 1]} />
                <meshStandardMaterial color="#fef3c7" />
            </mesh>
            <mesh position={[-12.5, 5, 0]} rotation={[0, Math.PI/2, 0]}>
                <boxGeometry args={[25, 10, 1]} />
                <meshStandardMaterial color="#fef3c7" />
            </mesh>
            <mesh position={[12.5, 5, 0]} rotation={[0, Math.PI/2, 0]}>
                <boxGeometry args={[25, 10, 1]} />
                <meshStandardMaterial color="#fef3c7" />
            </mesh>
             <mesh position={[0, 5, 12.5]}>
                <boxGeometry args={[25, 10, 1]} />
                <meshStandardMaterial color="#fef3c7" />
            </mesh>

            {/* --- LIGHTING --- */}
            <pointLight position={[0, 8, 0]} intensity={0.8} castShadow />

            {/* --- FURNITURE (Conditionally Rendered) --- */}

            {isOwned("Master Bed") && (
                <FurnitureItem position={[-8, 0.5, -8]} name="Master Bed" onClick={onSleep}>
                    <mesh castShadow><boxGeometry args={[4, 1, 5]} /><primitive object={woodMat} /></mesh>
                    <mesh position={[-1, 0.6, -2]}><boxGeometry args={[1.5, 0.3, 1]} /><primitive object={whiteMat} /></mesh> 
                    <mesh position={[1, 0.6, -2]}><boxGeometry args={[1.5, 0.3, 1]} /><primitive object={whiteMat} /></mesh> 
                    <mesh position={[0, 0.55, 1]}><boxGeometry args={[3.8, 0.1, 3]} /><primitive object={fabricMat} /></mesh> 
                </FurnitureItem>
            )}

            {isOwned("Bedside Table") && (
                <FurnitureItem position={[-5.5, 0.75, -8]} name="Bedside Table">
                    <mesh castShadow><boxGeometry args={[1, 1.5, 1]} /><primitive object={woodMat} /></mesh>
                    <mesh position={[0, 0.3, 0.51]}><boxGeometry args={[0.8, 0.4, 0.05]} /><primitive object={whiteMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Child Bed") && (
                <FurnitureItem position={[-11, 0.4, -3]} name="Child Bed" onClick={onSleep}>
                    <mesh castShadow><boxGeometry args={[2, 0.8, 3.5]} /><primitive object={woodMat} /></mesh>
                    <mesh position={[0, 0.5, -1.2]}><boxGeometry args={[1.5, 0.25, 0.8]} /><primitive object={whiteMat} /></mesh> 
                    <mesh position={[0, 0.45, 0.5]}><boxGeometry args={[1.8, 0.1, 2.5]} /><primitive object={childFabricMat} /></mesh> 
                </FurnitureItem>
            )}

            {isOwned("Pet Bed") && (
                <FurnitureItem position={[-4, 0.2, -8]} name="Pet Bed">
                    <mesh><cylinderGeometry args={[1.5, 1.5, 0.4]} /><primitive object={fabricMat} /></mesh>
                    <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[1.2, 1.2, 0.5]} /><meshStandardMaterial color="#fff" /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Wardrobe") && (
                <FurnitureItem position={[-11, 3, -6.5]} name="Wardrobe">
                    <mesh castShadow><boxGeometry args={[2, 6, 2]} /><primitive object={woodMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Rug") && (
                <FurnitureItem position={[0, 0.01, 0]} name="Rug">
                    <mesh rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[4, 32]} /><meshStandardMaterial color="#fbbf24" /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Sofa") && (
                <FurnitureItem position={[0, 1, -4]} name="Sofa">
                    <mesh castShadow><boxGeometry args={[6, 1, 2]} /><primitive object={fabricMat} /></mesh>
                    <mesh position={[0, 1, -0.8]}><boxGeometry args={[6, 1.5, 0.4]} /><primitive object={fabricMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("TV") && (
                <FurnitureItem position={[0, 2, 4]} name="TV" rotation={[0, Math.PI, 0]}>
                    <mesh><boxGeometry args={[4, 2.5, 0.2]} /><meshStandardMaterial color="black" /></mesh>
                    <mesh position={[0, -1.5, 0]}><boxGeometry args={[4, 1, 1]} /><primitive object={woodMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Table") && (
                <FurnitureItem position={[0, 0.8, -1]} name="Table">
                    <mesh><cylinderGeometry args={[2.5, 2.5, 0.1]} /><primitive object={woodMat} /></mesh>
                    <mesh position={[0, -0.4, 0]}><cylinderGeometry args={[0.3, 0.3, 0.8]} /><primitive object={woodMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Plant") && (
                <FurnitureItem position={[5, 0, -5]} name="Plant">
                    <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.5, 0.4, 1]} /><primitive object={whiteMat} /></mesh>
                    <mesh position={[0, 1.5, 0]}><dodecahedronGeometry args={[0.8]} /><meshStandardMaterial color="green" /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Bookshelf") && (
                <FurnitureItem position={[-11, 3, 2]} name="Bookshelf">
                    <mesh castShadow><boxGeometry args={[2, 6, 3]} /><primitive object={woodMat} /></mesh>
                    <mesh position={[1, 0, 0]}><boxGeometry args={[0.1, 5, 2]} /><meshStandardMaterial color="#334155" /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Lamp") && (
                <FurnitureItem position={[-5, 0, -4]} name="Lamp">
                    <mesh position={[0, 3, 0]}><coneGeometry args={[0.8, 1, 32, 1, true]} /><meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} /></mesh>
                    <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.1, 0.1, 3]} /><primitive object={metalMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Sink") && (
                <FurnitureItem position={[8, 1.5, -8]} name="Sink">
                    <mesh><boxGeometry args={[2, 3, 2]} /><primitive object={whiteMat} /></mesh>
                    <mesh position={[0, 1.6, 0]}><boxGeometry args={[1.5, 0.2, 1.5]} /><primitive object={metalMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Stove") && (
                <FurnitureItem position={[10, 1.5, -8]} name="Stove">
                    <mesh><boxGeometry args={[2, 3, 2]} /><primitive object={metalMat} /></mesh>
                    <mesh position={[0, 1.6, 0.5]}><cylinderGeometry args={[0.3, 0.3, 0.1]} /><meshStandardMaterial color="black" /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Fridge") && (
                <FurnitureItem position={[10, 3, -5]} name="Fridge">
                    <mesh><boxGeometry args={[2.5, 6, 2.5]} /><primitive object={whiteMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Microwave") && (
                <FurnitureItem position={[8, 3.5, -8]} name="Microwave">
                    <mesh><boxGeometry args={[1.5, 1, 1]} /><primitive object={metalMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Trash Can") && (
                <FurnitureItem position={[11, 1, -3]} name="Trash Can">
                    <mesh><cylinderGeometry args={[0.5, 0.4, 2]} /><meshStandardMaterial color="gray" /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Desk") && (
                <FurnitureItem position={[-10, 1.5, 8]} name="Desk">
                    <mesh><boxGeometry args={[3, 0.1, 2]} /><primitive object={woodMat} /></mesh>
                    <mesh position={[-1.4, -0.75, 0]}><boxGeometry args={[0.2, 1.5, 2]} /><primitive object={woodMat} /></mesh>
                    <mesh position={[1.4, -0.75, 0]}><boxGeometry args={[0.2, 1.5, 2]} /><primitive object={woodMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Chair") && (
                <FurnitureItem position={[-8, 1, 8]} name="Chair" rotation={[0, -Math.PI/2, 0]}>
                    <mesh><boxGeometry args={[1, 1, 1]} /><primitive object={woodMat} /></mesh>
                    <mesh position={[0, 1, -0.4]}><boxGeometry args={[1, 1, 0.1]} /><primitive object={woodMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Computer") && (
                <FurnitureItem position={[-10, 2, 8]} name="Computer">
                    <mesh><boxGeometry args={[1, 0.8, 0.1]} /><meshStandardMaterial color="black" /></mesh>
                    <mesh position={[0, 0, 0.05]}><planeGeometry args={[0.9, 0.7]} /><meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Shower") && (
                <FurnitureItem position={[10, 0.1, 10]} name="Shower">
                    <mesh position={[0, 1.5, 0]}><boxGeometry args={[3, 0.1, 3]} /><primitive object={whiteMat} /></mesh> 
                    <mesh position={[-1.4, 3, 0]}><boxGeometry args={[0.1, 6, 3]} /><primitive object={glassMat} /></mesh>
                    <mesh position={[0, 3, -1.4]}><boxGeometry args={[3, 6, 0.1]} /><primitive object={glassMat} /></mesh>
                    <mesh position={[0, 5, 0]}><cylinderGeometry args={[0.5, 0.5, 0.2]} /><primitive object={metalMat} /></mesh> 
                </FurnitureItem>
            )}

            {isOwned("Toilet") && (
                <FurnitureItem position={[6, 1, 11]} name="Toilet">
                    <mesh><boxGeometry args={[1, 1, 1.5]} /><primitive object={whiteMat} /></mesh>
                    <mesh position={[0, 1, -0.5]}><boxGeometry args={[1, 1.5, 0.5]} /><primitive object={whiteMat} /></mesh>
                </FurnitureItem>
            )}

            {isOwned("Mirror") && (
                <FurnitureItem position={[8, 3, 11.9]} name="Mirror">
                    <mesh><boxGeometry args={[2, 3, 0.1]} /><primitive object={glassMat} /></mesh>
                </FurnitureItem>
            )}

            {/* --- DOOR (Exit) --- */}
            <group position={[0, 0, 12.5]} onClick={onExit} onPointerOver={() => document.body.style.cursor='pointer'} onPointerOut={() => document.body.style.cursor='auto'}>
                <mesh position={[0, 2.5, 0]}>
                    <boxGeometry args={[4, 5, 0.5]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
                <mesh position={[0, 3, 0.3]}>
                     <boxGeometry args={[3, 1, 0.1]} />
                     <meshStandardMaterial color="red" />
                </mesh>
            </group>

            {/* Player Controller restricted to room */}
            <PlayerController 
                buildings={collisionObjects}
                onPositionChange={onPositionChange}
                onInteract={() => {}} // Simple interaction for now
                position={playerPosition}
                isWorking={false}
                boundary={12}
                appearance={appearance}
                vehicle={null} // Can't drive in house
            />

            {/* Pets in the house */}
            {pets.map((pet, index) => (
                <PetFollower 
                    key={pet.id} 
                    pet={pet}
                    targetPosition={playerPosition} 
                    index={index}
                    onClick={onPetClick}
                />
            ))}

        </group>
    );
};

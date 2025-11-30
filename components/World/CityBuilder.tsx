


import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Building, RegionType, HOUSE_PRICES, NPC, CharacterAppearance, DogBreed, STORE_PRICE } from '../../types';

export const TILE_SIZE = 10;
export const CITY_SIZE = 12; // Increased from 10 to 12 for bigger world
export const ROOM_WIDTH = CITY_SIZE * TILE_SIZE;
export const ROOM_DEPTH = CITY_SIZE * TILE_SIZE;

interface CityData {
  buildings: Building[];
  roads: { position: [number, number, number], rotation: number }[];
  sanctuaryPosition: [number, number, number];
  ventPosition: [number, number, number];
  cemeteryPosition: [number, number, number];
  rentalPosition: [number, number, number];
  carWashPosition: [number, number, number];
  carFactoryPosition: [number, number, number];
  stStationPosition: [number, number, number];
  msStationPosition: [number, number, number];
  royalCarriagePosition: [number, number, number];
}

const NAMES = ["Alex", "Jordan", "Taylor", "Casey", "Jamie", "Sam", "Charlie", "Riley", "Avery", "Parker"];
const DOG_NAMES = ["Buddy", "Max", "Bella", "Daisy", "Rocky", "Luna", "Coco", "Bear"];

const getRandomAppearance = (): CharacterAppearance => ({
    hairStyle: ['PONYTAIL', 'BOB', 'LONG', 'BUNS'][Math.floor(Math.random()*4)] as any,
    hairColor: ['#1a1a1a', '#5d4037', '#eab308', '#fca5a5'][Math.floor(Math.random()*4)],
    skinColor: ['#fce7f3', '#ffdbac', '#e0ac69', '#3e2723'][Math.floor(Math.random()*4)],
    eyeColor: '#000000',
    eyebrowStyle: 'ARCHED',
    lipColor: '#fca5a5',
    topType: Math.random() > 0.5 ? 'TSHIRT' : 'JACKET',
    topColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random()*4)],
    bottomType: Math.random() > 0.5 ? 'PANTS_LONG' : 'SKIRT',
    bottomColor: '#1f2937',
    sockColor: '#ffffff',
    shoeColor: '#000000',
    hasNecklace: Math.random() > 0.8,
    hasEarrings: Math.random() > 0.8,
    hasBracelets: false,
    hasRing: false
});

const getPrisonerAppearance = (): CharacterAppearance => ({
    ...getRandomAppearance(),
    topColor: '#000000',
    bottomColor: '#000000',
    topType: 'TSHIRT',
    bottomType: 'PANTS_LONG',
    shoeColor: '#333333'
});

export const generateNPCs = (count: number): NPC[] => {
    const npcs: NPC[] = [];
    for (let i = 0; i < count; i++) {
        const isHuman = Math.random() > 0.4; // 60% Humans
        const x = (Math.random() - 0.5) * (CITY_SIZE * TILE_SIZE - 20);
        const z = (Math.random() - 0.5) * (CITY_SIZE * TILE_SIZE - 20);
        
        // 20% Chance for a human to be "Short" (Target for ST)
        const isShort = isHuman && Math.random() > 0.8;
        
        // 10% Chance for a human to be "Prisoner" (Target for MS) - Black Clothes
        const isPrisoner = isHuman && !isShort && Math.random() > 0.85;

        npcs.push({
            id: `npc-${Date.now()}-${i}`,
            type: isHuman ? 'HUMAN' : 'DOG',
            name: isHuman ? NAMES[Math.floor(Math.random() * NAMES.length)] : DOG_NAMES[Math.floor(Math.random() * DOG_NAMES.length)],
            position: [x, 0, z],
            rotation: Math.random() * Math.PI * 2,
            color: '#ffffff',
            breed: isHuman ? undefined : ['GOLDEN', 'PUG', 'HUSKY', 'DALMATIAN'][Math.floor(Math.random() * 4)],
            appearance: isPrisoner ? getPrisonerAppearance() : (isHuman ? getRandomAppearance() : undefined),
            carryingItem: isHuman && !isShort && !isPrisoner && Math.random() > 0.7 ? (Math.random() > 0.5 ? 'BOX' : 'BAG') : null,
            isShort: isShort,
            isPrisoner: isPrisoner
        });
    }
    return npcs;
};

export const generateCity = (region: RegionType): CityData => {
  const buildings: Building[] = [];
  const roads: { position: [number, number, number], rotation: number }[] = [];
  let sanctuaryPosition: [number, number, number] = [0, 0, 0];
  let ventPosition: [number, number, number] = [45, 0, 45]; // Default
  let cemeteryPosition: [number, number, number] = [-45, 0, -35]; // Default fixed spot
  let rentalPosition: [number, number, number] = [35, 0, -35]; // Default fixed spot
  let carWashPosition: [number, number, number] = [-35, 0, 35]; // Default fixed spot
  let carFactoryPosition: [number, number, number] = [35, 0, 35]; // Default fixed spot
  let stStationPosition: [number, number, number] = [-55, 0, 55]; // Far corner
  let msStationPosition: [number, number, number] = [55, 0, 55]; // Opposite Far corner
  let royalCarriagePosition: [number, number, number] = [-55, 0, 25]; // Bottom Left Area

  // Grid Generation
  for (let x = -CITY_SIZE / 2; x < CITY_SIZE / 2; x++) {
    for (let z = -CITY_SIZE / 2; z < CITY_SIZE / 2; z++) {
      const posX = x * TILE_SIZE;
      const posZ = z * TILE_SIZE;
      const isRoad = x % 2 === 0 || z % 2 === 0;

      // Force fixed locations
      const isCemeterySpot = x === -4 && z === -3; 
      const isRentalSpot = x === 3 && z === -3; 
      const isCarWashSpot = x === -3 && z === 3;
      const isFactorySpot = x === 3 && z === 3;
      const isSTSpot = x === -5 && z === 5; // Corner
      const isMSSpot = x === 5 && z === 5; // Opposite Corner
      const isRoyalSpot = x === -5 && z === 2; // Bottom Left side

      if (isCemeterySpot) {
          cemeteryPosition = [posX, 0, posZ];
          buildings.push({ id: `cemetery-${x}-${z}`, type: 'PET_CEMETERY', position: [posX, 0, posZ], rotation: 0 });
          continue;
      }
      if (isRentalSpot) {
          rentalPosition = [posX, 0, posZ];
          buildings.push({ id: `rental-${x}-${z}`, type: 'CAR_RENTAL', position: [posX, 0, posZ], rotation: 0 });
          continue;
      }
      if (isCarWashSpot) {
          carWashPosition = [posX, 0, posZ];
          buildings.push({ id: `carwash-${x}-${z}`, type: 'CAR_WASH', position: [posX, 0, posZ], rotation: 0 });
          continue;
      }
      if (isFactorySpot) {
          carFactoryPosition = [posX, 0, posZ];
          buildings.push({ id: `factory-${x}-${z}`, type: 'CAR_FACTORY', position: [posX, 0, posZ], rotation: 0 });
          continue;
      }
      if (isSTSpot) {
          stStationPosition = [posX, 0, posZ];
          buildings.push({ id: `st-${x}-${z}`, type: 'ST_STATION', position: [posX, 0, posZ], rotation: 0 });
          continue;
      }
      if (isMSSpot) {
          msStationPosition = [posX, 0, posZ];
          buildings.push({ id: `ms-${x}-${z}`, type: 'MS_STATION', position: [posX, 0, posZ], rotation: 0 });
          continue;
      }
      if (isRoyalSpot) {
          royalCarriagePosition = [posX, 0, posZ];
          buildings.push({ id: `royal-${x}-${z}`, type: 'ROYAL_CARRIAGE', position: [posX, 0, posZ], rotation: 0 });
          continue;
      }

      if (isRoad) {
        roads.push({ position: [posX, 0.1, posZ], rotation: 0 });
        buildings.push({ id: `road-${x}-${z}`, type: 'ROAD', position: [posX, 0, posZ], rotation: 0 });
      } else {
        // Building Lots
        const rand = Math.random();
        let type: Building['type'] = 'HOUSE_L1';
        let price = HOUSE_PRICES.HOUSE_L1;
        let isOccupied = false;

        if (rand > 0.95) {
            type = 'HOTEL';
        } else if (rand > 0.90) {
             type = 'STORE'; 
             price = STORE_PRICE;
        } else if (rand > 0.85) {
             type = 'PET_SANCTUARY';
             sanctuaryPosition = [posX, 0, posZ];
        } else if (rand > 0.65) {
            type = 'HOUSE_L3';
            price = HOUSE_PRICES.HOUSE_L3;
            isOccupied = Math.random() > 0.3; 
        } else if (rand > 0.4) {
            type = 'HOUSE_L2';
            price = HOUSE_PRICES.HOUSE_L2;
            isOccupied = Math.random() > 0.3;
        } else {
            type = 'HOUSE_L1';
            price = HOUSE_PRICES.HOUSE_L1;
            isOccupied = Math.random() > 0.3;
        }

        buildings.push({
          id: `bld-${x}-${z}`,
          type,
          position: [posX, 0, posZ],
          rotation: (Math.floor(Math.random() * 4) * Math.PI) / 2,
          price: (type.includes('HOUSE') || type === 'STORE') ? price : undefined,
          isOwned: false,
          isRecruited: false,
          isOccupied
        });
      }
    }
  }

  return { buildings, roads, sanctuaryPosition, ventPosition, cemeteryPosition, rentalPosition, carWashPosition, carFactoryPosition, stStationPosition, msStationPosition, royalCarriagePosition };
};

// --- Visual Components ---

const HouseMesh: React.FC<{ type: string; isOwned?: boolean; isOccupied?: boolean }> = ({ type, isOwned, isOccupied }) => {
    const color = isOwned ? '#4ade80' : isOccupied ? '#f472b6' : '#ffffff'; 
    const height = type === 'HOUSE_L1' ? 3 : type === 'HOUSE_L2' ? 6 : 9;
    return (
        <group>
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[6, height, 6]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, height + 1, 0]}>
                <coneGeometry args={[4.5, 2, 4]} rotation={[0, Math.PI/4, 0]} />
                <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 1.5, 3.1]}>
                <planeGeometry args={[1.5, 3]} />
                <meshStandardMaterial color="#475569" />
            </mesh>
            {isOccupied && (
                 <mesh position={[0, height, 3.1]}>
                     <boxGeometry args={[0.5, 0.5, 0.1]} />
                     <meshStandardMaterial color="yellow" emissive="yellow" />
                 </mesh>
            )}
        </group>
    );
};

const HotelMesh: React.FC = () => (
    <group>
        <mesh position={[0, 6, 0]} castShadow>
            <boxGeometry args={[8, 12, 8]} />
            <meshStandardMaterial color="#fcd34d" />
        </mesh>
        <mesh position={[3, 4, 4.1]}>
            <boxGeometry args={[3, 1, 0.2]} />
            <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[2, 2, 4.2]}>
             <cylinderGeometry args={[0.3, 0.3, 0.2]} rotation={[Math.PI/2, 0, 0]} />
             <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
        </mesh>
    </group>
);

const StoreMesh: React.FC<{ isOwned?: boolean, onRecruitClick?: () => void, onWorkClick?: () => void }> = ({ isOwned, onRecruitClick, onWorkClick }) => (
    <group>
        <mesh position={[0, 4, 0]} castShadow>
            <boxGeometry args={[7, 8, 7]} />
            <meshStandardMaterial color={isOwned ? "#a855f7" : "#60a5fa"} /> 
        </mesh>
        <mesh position={[0, 8.5, 0]}>
             <coneGeometry args={[5, 2, 4]} rotation={[0, Math.PI/4, 0]} />
             <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        
        {/* Recruit Sign & Button - 2nd Floor (y=5 area) */}
        {!isOwned && (
            <group>
                 <mesh position={[2, 5, 3.6]}>
                    <boxGeometry args={[2, 1.5, 0.2]} />
                    <meshStandardMaterial color="#ef4444" />
                </mesh>
                <mesh 
                    position={[2, 2.5, 3.6]} 
                    rotation={[Math.PI/2, 0, 0]} 
                    onClick={(e) => { e.stopPropagation(); onRecruitClick && onRecruitClick(); }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                     <cylinderGeometry args={[0.4, 0.4, 0.2]} />
                     <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
                </mesh>
            </group>
        )}

        {/* Owned: Work Station on 3rd Floor (y=7) */}
        {isOwned && (
            <group>
                 <mesh position={[0, 9.5, 0]}>
                     <sphereGeometry args={[0.5]} />
                     <meshStandardMaterial color="gold" emissive="gold" />
                 </mesh>
                 {/* 3rd Floor Work Button Window */}
                 <mesh 
                    position={[0, 7, 3.6]} 
                    onClick={(e) => { e.stopPropagation(); onWorkClick && onWorkClick(); }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                 >
                     <boxGeometry args={[3, 1.5, 0.2]} />
                     <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.8} />
                 </mesh>
                 <mesh position={[0, 7, 3.75]} rotation={[0,0,Math.PI/2]}>
                     <boxGeometry args={[1, 0.2, 0.1]} />
                     <meshStandardMaterial color="white" />
                 </mesh>
                 <mesh position={[0, 7, 3.75]}>
                     <boxGeometry args={[2.5, 0.2, 0.1]} />
                     <meshStandardMaterial color="white" />
                 </mesh>
            </group>
        )}
    </group>
);

const SanctuaryMesh: React.FC = () => (
    <group>
        <mesh position={[0, 4, 0]} castShadow>
             <cylinderGeometry args={[5, 5, 8, 8]} />
             <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0, 9, 0]}>
             <sphereGeometry args={[5]} />
             <meshStandardMaterial color="#93c5fd" transparent opacity={0.8} />
        </mesh>
    </group>
);

const CemeteryMesh: React.FC = () => (
    <group>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[9, 9]} />
            <meshStandardMaterial color="#4a4a4a" />
        </mesh>
        <mesh position={[4, 1, 4]} castShadow><boxGeometry args={[0.5, 2, 0.5]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
        <mesh position={[-4, 1, 4]} castShadow><boxGeometry args={[0.5, 2, 0.5]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
        <mesh position={[4, 1, -4]} castShadow><boxGeometry args={[0.5, 2, 0.5]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
        <mesh position={[-4, 1, -4]} castShadow><boxGeometry args={[0.5, 2, 0.5]} /><meshStandardMaterial color="#2d2d2d" /></mesh>
        <group position={[-2, 0, -2]}>
            <mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[0.8, 1.2, 0.2]} /><meshStandardMaterial color="#9ca3af" /></mesh>
            <mesh position={[0, 0, 0.5]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[0.8, 1]} /><meshStandardMaterial color="#1f2937" /></mesh>
        </group>
        <group position={[3, 0, -3]}>
            <mesh position={[0, 2, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.5, 4]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
            <mesh position={[0.5, 3, 0]} rotation={[0, 0, -0.5]}>
                <cylinderGeometry args={[0.1, 0.15, 2]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
        </group>
    </group>
);

const RentalMesh: React.FC<{ onRentClick: () => void }> = ({ onRentClick }) => (
    <group>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[9, 9]} />
            <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[3, 2, 3]} castShadow>
             <boxGeometry args={[2.5, 4, 2.5]} />
             <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[-1, 1, 0]} castShadow>
            <boxGeometry args={[2, 1, 4]} />
            <meshStandardMaterial color="#ef4444" />
        </mesh>
        <group 
            position={[1, 1, 2]} 
            onClick={(e) => { e.stopPropagation(); onRentClick(); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
             <mesh position={[0, -0.5, 0]}>
                 <cylinderGeometry args={[0.1, 0.1, 1]} />
                 <meshStandardMaterial color="#94a3b8" />
             </mesh>
             <mesh rotation={[Math.PI/4, 0, 0]}>
                 <boxGeometry args={[0.6, 0.4, 0.1]} />
                 <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.5} />
             </mesh>
        </group>
    </group>
);

const CarWashMesh: React.FC<{ onWashClick: () => void }> = ({ onWashClick }) => (
    <group>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[9, 9]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.4} roughness={0.1} />
        </mesh>
        <group position={[0, 3, 0]}>
             <mesh position={[-3, 0, 0]} castShadow><boxGeometry args={[1, 6, 8]} /><meshStandardMaterial color="#e0f2fe" /></mesh>
             <mesh position={[3, 0, 0]} castShadow><boxGeometry args={[1, 6, 8]} /><meshStandardMaterial color="#e0f2fe" /></mesh>
             <mesh position={[0, 3.5, 0]}><boxGeometry args={[7, 1, 8]} /><meshStandardMaterial color="#0284c7" /></mesh>
        </group>
        <mesh position={[-2, 2, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.8, 0.8, 4]} /><meshStandardMaterial color="#f472b6" /></mesh>
        <mesh position={[2, 2, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.8, 0.8, 4]} /><meshStandardMaterial color="#f472b6" /></mesh>
        <group position={[4, 1.5, 4]}>
            <mesh position={[0, -1, 0]}><cylinderGeometry args={[0.1, 0.1, 2]} /><meshStandardMaterial color="#64748b" /></mesh>
            <mesh 
                rotation={[0, -Math.PI/4, 0]}
                onClick={(e) => { e.stopPropagation(); onWashClick(); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <boxGeometry args={[0.8, 0.6, 0.1]} />
                <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[-0.2, 0, 0.06]} rotation={[0, -Math.PI/4, 0]}><planeGeometry args={[0.6, 0.4]} /><meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} /></mesh>
        </group>
    </group>
);

const CarFactoryMesh: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <group>
        <mesh position={[0, 5, 0]} castShadow>
            <boxGeometry args={[8, 10, 8]} />
            <meshStandardMaterial color="#4c1d95" /> 
        </mesh>
        <mesh position={[0, 11, 0]}>
             <coneGeometry args={[6, 3, 4]} rotation={[0, Math.PI/4, 0]} />
             <meshStandardMaterial color="#2e1065" />
        </mesh>
        <mesh position={[3, 9, 3]}>
            <cylinderGeometry args={[0.5, 0.8, 4]} />
            <meshStandardMaterial color="#581c87" />
        </mesh>
        <mesh position={[0, 2, 4.1]}>
            <boxGeometry args={[4, 4, 0.2]} />
            <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Removed white board here to avoid confusion */}
        <mesh position={[0, 6, 4.1]}>
             <boxGeometry args={[6, 1.5, 0.2]} />
             <meshStandardMaterial color="#6d28d9" />
        </mesh>
    </group>
);

const STStationMesh: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <group>
        {/* Dark Garage Look */}
        <mesh position={[0, 4, 0]} castShadow>
            <boxGeometry args={[8, 8, 8]} />
            <meshStandardMaterial color="#1c1917" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 9, 0]}>
            <boxGeometry args={[8.5, 1, 8.5]} />
            <meshStandardMaterial color="#b91c1c" />
        </mesh>
        {/* Large Garage Door */}
        <mesh position={[0, 3, 4.1]}>
            <planeGeometry args={[6, 5]} />
            <meshStandardMaterial color="#44403c" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Glowing ST Sign */}
        <mesh position={[0, 6.5, 4.2]}>
            <boxGeometry args={[3, 1.2, 0.2]} />
            <meshStandardMaterial color="#000" />
        </mesh>
        <group position={[0, 6.5, 4.35]}>
            {/* S */}
            <mesh position={[-0.8, 0, 0]}>
                 <torusGeometry args={[0.3, 0.05, 8, 16, 4]} />
                 <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
            </mesh>
            {/* T */}
            <mesh position={[0.5, 0.2, 0]}>
                <boxGeometry args={[0.8, 0.1, 0.05]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
            </mesh>
             <mesh position={[0.5, -0.2, 0]}>
                <boxGeometry args={[0.1, 0.8, 0.05]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
            </mesh>
        </group>
    </group>
);

const MSStationMesh: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <group>
        <mesh position={[0, 4, 0]} castShadow>
            <boxGeometry args={[8, 8, 8]} />
            <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        {/* Sign */}
        <mesh position={[0, 6, 4.1]}>
             <boxGeometry args={[3, 1.2, 0.2]} />
             <meshStandardMaterial color="#4c1d95" />
        </mesh>
        <group position={[0, 6, 4.25]}>
            {/* M */}
            <mesh position={[-0.8, 0, 0]}>
                <boxGeometry args={[0.8, 0.1, 0.05]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>
             <mesh position={[-0.8, -0.2, 0]}>
                <boxGeometry args={[0.1, 0.8, 0.05]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.4, -0.2, 0]}>
                <boxGeometry args={[0.1, 0.8, 0.05]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-1.2, -0.2, 0]}>
                <boxGeometry args={[0.1, 0.8, 0.05]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>

            {/* S */}
             <mesh position={[0.5, 0, 0]}>
                 <torusGeometry args={[0.3, 0.05, 8, 16, 4]} />
                 <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
            </mesh>
        </group>
    </group>
);

const RoyalCarriageMesh: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <group onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerOver={() => document.body.style.cursor='pointer'} onPointerOut={() => document.body.style.cursor='auto'}>
        <mesh position={[0, 2, 0]} castShadow>
            <boxGeometry args={[5, 4, 8]} />
            <meshStandardMaterial color="#f472b6" /> {/* Pink */}
        </mesh>
        <mesh position={[0, 4.5, 0]} castShadow>
             <cylinderGeometry args={[3, 3, 1, 8]} />
             <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Wheels */}
        <mesh position={[2.5, 1, 2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1, 1, 0.5, 16]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[-2.5, 1, 2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1, 1, 0.5, 16]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[2.5, 1, -2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1, 1, 0.5, 16]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[-2.5, 1, -2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1, 1, 0.5, 16]} /><meshStandardMaterial color="#333" /></mesh>
        
        {/* Entrance Indication */}
        <mesh position={[0, 1.5, 4.1]}>
             <planeGeometry args={[2, 3]} />
             <meshStandardMaterial color="black" />
        </mesh>
    </group>
);

const VentMesh: React.FC = () => (
    <group>
        <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[4, 2, 4]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[3, 3]} />
            <meshStandardMaterial color="#1e293b" wireframe />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
             <boxGeometry args={[3, 0.5, 0.1]} />
             <meshStandardMaterial color="black" />
        </mesh>
    </group>
)

export const CityInstances: React.FC<{ 
    cityData: CityData; 
    ownedHouses: string[]; 
    recruitedIds: string[];
    region: RegionType;
    onRecruit: (id: string) => void;
    onRent: () => void;
    onWash: () => void;
    onFactory: () => void;
    onSTStation: () => void;
    onMSStation: () => void;
    onRoyalCarriage: () => void;
    onWork: () => void;
}> = ({ cityData, ownedHouses, recruitedIds, region, onRecruit, onRent, onWash, onFactory, onSTStation, onMSStation, onRoyalCarriage, onWork }) => {
    
    const groundColor = region === 'DESERT' ? '#fbbf24' : region === 'SWAMP' ? '#3f6212' : '#22c55e';
    const waterColor = region === 'SWAMP' ? '#14532d' : '#3b82f6';

    return (
        <group>
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                 <planeGeometry args={[CITY_SIZE * TILE_SIZE + 20, CITY_SIZE * TILE_SIZE + 20]} />
                 <meshStandardMaterial color={groundColor} />
             </mesh>
             {region === 'RIVERSIDE' && (
                 <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                     <planeGeometry args={[300, 300]} />
                     <meshStandardMaterial color={waterColor} />
                 </mesh>
             )}
             <group position={new THREE.Vector3(...cityData.ventPosition)}>
                 <VentMesh />
             </group>
             {cityData.buildings.map((b) => (
                 <group key={b.id} position={new THREE.Vector3(...b.position)} rotation={[0, b.rotation, 0]}>
                     {b.type === 'ROAD' && (
                         <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
                             <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
                             <meshStandardMaterial color="#1e293b" />
                         </mesh>
                     )}
                     {b.type.includes('HOUSE') && <HouseMesh type={b.type} isOwned={ownedHouses.includes(b.id)} isOccupied={b.isOccupied} />}
                     {b.type === 'HOTEL' && <HotelMesh />}
                     {b.type === 'PET_SANCTUARY' && <SanctuaryMesh />}
                     {b.type === 'STORE' && <StoreMesh isOwned={ownedHouses.includes(b.id)} onRecruitClick={() => onRecruit(b.id)} onWorkClick={() => { if(ownedHouses.includes(b.id)) onWork(); }} />}
                     {b.type === 'PET_CEMETERY' && <CemeteryMesh />}
                     {b.type === 'CAR_RENTAL' && <RentalMesh onRentClick={onRent} />}
                     {b.type === 'CAR_WASH' && <CarWashMesh onWashClick={onWash} />}
                     {b.type === 'CAR_FACTORY' && <CarFactoryMesh onClick={onFactory} />}
                     {b.type === 'ST_STATION' && <STStationMesh onClick={onSTStation} />}
                     {b.type === 'MS_STATION' && <MSStationMesh onClick={onMSStation} />}
                     {b.type === 'ROYAL_CARRIAGE' && <RoyalCarriageMesh onClick={onRoyalCarriage} />}
                 </group>
             ))}
        </group>
    );
};

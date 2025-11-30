
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PetType, PetAccessories } from '../../types';

interface PetAvatarProps {
  type: PetType;
  breed: string;
  accessories: PetAccessories;
  isWalking?: boolean;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({ type, breed, accessories }) => {
  
  // --- Breed Logic ---
  const colors = useMemo(() => {
    let main = '#ffffff';
    let secondary = '#ffffff'; // For spots, ears, etc.
    let eye = 'black';

    // Cats
    if (breed === 'BLACK') { main = '#1a1a1a'; secondary = '#1a1a1a'; }
    if (breed === 'ORANGE') { main = '#f97316'; secondary = '#fdba74'; }
    if (breed === 'GRAY') { main = '#94a3b8'; secondary = '#cbd5e1'; }
    if (breed === 'SIAMESE') { main = '#f1e6d0'; secondary = '#3e2723'; }
    if (breed === 'CALICO') { main = '#ffffff'; secondary = '#ea580c'; } // Patches handled by geometry logic
    if (breed === 'TUXEDO') { main = '#1a1a1a'; secondary = '#ffffff'; }
    
    // Dogs
    if (breed === 'GOLDEN') { main = '#eab308'; secondary = '#fef08a'; }
    if (breed === 'PUG') { main = '#d6c0a0'; secondary = '#1f2937'; } // Dark face
    if (breed === 'HUSKY') { main = '#e2e8f0'; secondary = '#475569'; }
    if (breed === 'DALMATIAN') { main = '#ffffff'; secondary = '#1a1a1a'; }
    if (breed === 'SHEPHERD') { main = '#854d0e'; secondary = '#1a1a1a'; }
    if (breed === 'BEAGLE') { main = '#ffffff'; secondary = '#a16207'; }
    if (breed === 'POODLE') { main = '#fce7f3'; secondary = '#fbcfe8'; } // Pinkish white
    if (breed === 'BULLDOG') { main = '#a8a29e'; secondary = '#ffffff'; }

    // Birds
    if (breed === 'BLUE_JAY') { main = '#3b82f6'; secondary = '#ffffff'; }
    if (breed === 'CARDINAL') { main = '#ef4444'; secondary = '#1a1a1a'; }
    if (breed === 'CANARY') { main = '#facc15'; secondary = '#ffffff'; }
    if (breed === 'PARROT') { main = '#22c55e'; secondary = '#ef4444'; }

    return { main, secondary, eye };
  }, [breed]);

  // --- Rendering Helpers ---

  // CAT RENDERER
  if (type === 'CAT') {
      const isSiamese = breed === 'SIAMESE';
      const isCalico = breed === 'CALICO';
      const isTuxedo = breed === 'TUXEDO';
      const isPersian = breed === 'PERSIAN';

      return (
        <group scale={[0.6, 0.6, 0.6]}>
            {/* Body */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[0.5, 0.4, 0.8]} />
                <meshStandardMaterial color={colors.main} />
            </mesh>
            
            {/* Clothes (Cat) */}
            {accessories.hasClothing && (
                <mesh position={[0, 0.52, 0]}>
                    <boxGeometry args={[0.55, 0.42, 0.5]} />
                    <meshStandardMaterial color={accessories.clothingColor} />
                </mesh>
            )}

            {/* Calico Spots */}
            {isCalico && (
                <>
                    <mesh position={[0.1, 0.51, 0.2]}><boxGeometry args={[0.2, 0.41, 0.2]} /><meshStandardMaterial color={colors.secondary} /></mesh>
                    <mesh position={[-0.1, 0.51, -0.2]}><boxGeometry args={[0.2, 0.41, 0.2]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
                </>
            )}

            {/* Head */}
            <mesh position={[0, 0.8, 0.5]} castShadow>
                <boxGeometry args={[0.45, isPersian ? 0.35 : 0.4, 0.4]} />
                <meshStandardMaterial color={isSiamese ? colors.secondary : colors.main} />
            </mesh>

            {/* Collar */}
            {accessories.collarColor && (
                 <mesh position={[0, 0.6, 0.35]} rotation={[1.8, 0, 0]}>
                    <torusGeometry args={[0.18, 0.03, 8, 16]} />
                    <meshStandardMaterial color={accessories.collarColor} />
                 </mesh>
            )}

            {/* Ears */}
            <mesh position={[-0.15, 1.05, 0.5]}>
                <coneGeometry args={[0.08, 0.3, 4]} />
                <meshStandardMaterial color={isSiamese ? colors.secondary : colors.main} />
            </mesh>
            <mesh position={[0.15, 1.05, 0.5]}>
                <coneGeometry args={[0.08, 0.3, 4]} />
                <meshStandardMaterial color={isSiamese ? colors.secondary : colors.main} />
            </mesh>

            {/* Tail */}
            <mesh position={[0, 0.6, -0.5]} rotation={[0.5, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.6]} />
                <meshStandardMaterial color={isSiamese ? colors.secondary : (isTuxedo ? 'black' : colors.main)} />
            </mesh>

            {/* Legs & Shoes */}
            {[
                [-0.15, 0.25], [0.15, 0.25], [-0.15, -0.25], [0.15, -0.25]
            ].map((pos, i) => (
                <group key={i} position={[pos[0], 0, pos[1]]}>
                     <mesh position={[0, 0.2, 0]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.4]} />
                        <meshStandardMaterial color={isSiamese ? colors.secondary : (isTuxedo ? 'white' : colors.main)} />
                     </mesh>
                     {accessories.hasShoes && (
                         <mesh position={[0, 0.05, 0.05]}>
                             <boxGeometry args={[0.12, 0.1, 0.15]} />
                             <meshStandardMaterial color={accessories.shoeColor} />
                         </mesh>
                     )}
                </group>
            ))}
        </group>
      );
  }

  // DOG RENDERER
  if (type === 'DOG') {
      const isDalmatian = breed === 'DALMATIAN';
      const isHusky = breed === 'HUSKY';
      const isPug = breed === 'PUG';
      const isShepherd = breed === 'SHEPHERD';
      const floppyEars = !isHusky && !isShepherd;

      return (
        <group scale={[0.7, 0.7, 0.7]}>
             {/* Body */}
             <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[0.6, 0.6, 0.9]} />
                <meshStandardMaterial color={colors.main} />
             </mesh>

             {/* Clothes (Dog) */}
             {accessories.hasClothing && (
                <mesh position={[0, 0.62, 0]}>
                    <boxGeometry args={[0.65, 0.62, 0.6]} />
                    <meshStandardMaterial color={accessories.clothingColor} />
                </mesh>
             )}
             
             {/* Dalmatian Spots */}
             {isDalmatian && (
                 <>
                    <mesh position={[0.2, 0.61, 0.2]}><boxGeometry args={[0.1, 0.1, 0.1]} /><meshStandardMaterial color="black" /></mesh>
                    <mesh position={[-0.1, 0.61, -0.3]}><boxGeometry args={[0.1, 0.1, 0.1]} /><meshStandardMaterial color="black" /></mesh>
                    <mesh position={[0, 0.61, 0.3]}><boxGeometry args={[0.1, 0.1, 0.1]} /><meshStandardMaterial color="black" /></mesh>
                 </>
             )}

             {/* Head */}
             <mesh position={[0, 1.0, 0.6]} castShadow>
                 <boxGeometry args={[0.5, 0.5, 0.5]} />
                 <meshStandardMaterial color={isPug ? colors.secondary : colors.main} />
             </mesh>

             {/* Collar */}
             {accessories.collarColor && (
                 <mesh position={[0, 0.8, 0.4]} rotation={[1.6, 0, 0]}>
                    <torusGeometry args={[0.25, 0.04, 8, 16]} />
                    <meshStandardMaterial color={accessories.collarColor} />
                 </mesh>
            )}

             {/* Snout */}
             {!isPug && (
                <mesh position={[0, 0.9, 0.9]}>
                    <boxGeometry args={[0.25, 0.2, 0.3]} />
                    <meshStandardMaterial color={isShepherd ? 'black' : colors.main} />
                </mesh>
             )}

             {/* Ears */}
             {floppyEars ? (
                 <>
                    <mesh position={[-0.3, 1.0, 0.6]} rotation={[0, 0, 0.5]}>
                        <boxGeometry args={[0.1, 0.3, 0.2]} />
                        <meshStandardMaterial color={isBeagle(breed) ? colors.secondary : colors.main} />
                    </mesh>
                    <mesh position={[0.3, 1.0, 0.6]} rotation={[0, 0, -0.5]}>
                        <boxGeometry args={[0.1, 0.3, 0.2]} />
                        <meshStandardMaterial color={isBeagle(breed) ? colors.secondary : colors.main} />
                    </mesh>
                 </>
             ) : (
                 <>
                    <mesh position={[-0.2, 1.3, 0.6]}>
                        <coneGeometry args={[0.08, 0.2, 4]} />
                        <meshStandardMaterial color={colors.main} />
                    </mesh>
                    <mesh position={[0.2, 1.3, 0.6]}>
                        <coneGeometry args={[0.08, 0.2, 4]} />
                        <meshStandardMaterial color={colors.main} />
                    </mesh>
                 </>
             )}

             {/* Legs & Shoes */}
             {[
                [-0.2, 0.3], [0.2, 0.3], [-0.2, -0.3], [0.2, -0.3]
            ].map((pos, i) => (
                <group key={i} position={[pos[0], 0, pos[1]]}>
                     <mesh position={[0, 0.3, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.6]} />
                        <meshStandardMaterial color={colors.main} />
                     </mesh>
                     {accessories.hasShoes && (
                         <mesh position={[0, 0.05, 0.05]}>
                             <boxGeometry args={[0.15, 0.1, 0.2]} />
                             <meshStandardMaterial color={accessories.shoeColor} />
                         </mesh>
                     )}
                </group>
            ))}
        </group>
      );
  }

  // BIRD RENDERER
  if (type === 'BIRD') {
      return (
        <group scale={[0.5, 0.5, 0.5]}>
             {/* Body */}
             <mesh castShadow>
                <sphereGeometry args={[0.4]} />
                <meshStandardMaterial color={colors.main} />
             </mesh>
             
             {/* Clothes (Bird - Vest) */}
             {accessories.hasClothing && (
                <mesh>
                    <cylinderGeometry args={[0.42, 0.42, 0.4, 8, 1, true]} />
                    <meshStandardMaterial color={accessories.clothingColor} side={2} />
                </mesh>
             )}

             {/* Collar */}
             {accessories.collarColor && (
                 <mesh position={[0, 0.1, 0.35]} rotation={[1.6, 0, 0]}>
                    <torusGeometry args={[0.1, 0.02, 8, 16]} />
                    <meshStandardMaterial color={accessories.collarColor} />
                 </mesh>
             )}

             {/* Head Detail / Crest */}
             {(breed === 'CARDINAL' || breed === 'BLUE_JAY') && (
                 <mesh position={[0, 0.3, 0.1]} rotation={[-0.2, 0, 0]}>
                     <coneGeometry args={[0.1, 0.3, 4]} />
                     <meshStandardMaterial color={colors.main} />
                 </mesh>
             )}

             {/* Beak */}
             <mesh position={[0, 0, 0.35]}>
                <coneGeometry args={[0.1, 0.2, 8]} rotation={[1.5, 0, 0]} />
                <meshStandardMaterial color="orange" />
             </mesh>
             
             {/* Wings */}
             <BirdWing color={colors.secondary} side="left" />
             <BirdWing color={colors.secondary} side="right" />
        </group>
      );
  }

  return null;
};

const BirdWing: React.FC<{color: string, side: 'left' | 'right'}> = ({color, side}) => (
    <mesh position={[side === 'left' ? 0.35 : -0.35, 0, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.5]} />
        <meshStandardMaterial color={color} />
    </mesh>
);

const isBeagle = (breed: string) => breed === 'BEAGLE';

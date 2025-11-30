
import React from 'react';
import { CharacterAppearance } from '../../types';

interface PlayerAvatarProps {
  appearance: CharacterAppearance;
  isWalking?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ appearance, isWalking = false }) => {
  const { 
    hairStyle, hairColor, skinColor, eyeColor, eyebrowStyle, lipColor,
    topType, topColor, bottomType, bottomColor,
    sockColor, shoeColor,
    hasNecklace, hasEarrings, hasBracelets, hasRing
  } = appearance;

  // Helper to get arm rotation based on walking state
  const armRot = isWalking ? 0.2 : 0;
  const legRot = isWalking ? 0.2 : 0;

  return (
    <group>
        {/* --- HEAD GROUP --- */}
        <group position={[0, 1.6, 0]}>
            {/* Skull/Face Base */}
            <mesh castShadow>
                <boxGeometry args={[0.35, 0.45, 0.35]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
            
            {/* Sunken Eyes Effect - Brow Ridge */}
            <mesh position={[0, 0.1, 0.18]} castShadow>
                <boxGeometry args={[0.36, 0.08, 0.1]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>

            {/* Eyes */}
            <group position={[0, 0.05, 0.16]}>
                {/* Left Eye */}
                <mesh position={[-0.08, 0, 0]}>
                    <sphereGeometry args={[0.035, 12, 12]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[-0.08, 0, 0.03]}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshStandardMaterial color={eyeColor} />
                </mesh>
                {/* Right Eye */}
                <mesh position={[0.08, 0, 0]}>
                    <sphereGeometry args={[0.035, 12, 12]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                 <mesh position={[0.08, 0, 0.03]}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshStandardMaterial color={eyeColor} />
                </mesh>
            </group>

            {/* Eyebrows */}
            <group position={[0, 0.15, 0.2]}>
                 {/* Left */}
                 <mesh position={[-0.08, 0, 0]} rotation={[0, 0, eyebrowStyle === 'ARCHED' ? -0.2 : 0]}>
                    <boxGeometry args={[0.1, 0.02, 0.02]} />
                    <meshStandardMaterial color={hairColor} />
                 </mesh>
                 {/* Right */}
                 <mesh position={[0.08, 0, 0]} rotation={[0, 0, eyebrowStyle === 'ARCHED' ? 0.2 : 0]}>
                    <boxGeometry args={[0.1, 0.02, 0.02]} />
                    <meshStandardMaterial color={hairColor} />
                 </mesh>
            </group>

            {/* Lips */}
            <mesh position={[0, -0.12, 0.18]} scale={[1, 0.6, 1]}>
                 <torusGeometry args={[0.03, 0.01, 4, 8, Math.PI]} rotation={[0, 0, Math.PI]} />
                 <meshStandardMaterial color={lipColor} />
            </mesh>

            {/* Hair */}
            <group position={[0, 0.1, -0.05]}>
                <mesh castShadow position={[0, 0.1, 0]}>
                    <boxGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color={hairColor} />
                </mesh>
                {hairStyle === 'PONYTAIL' && (
                     <mesh position={[0, 0, -0.25]} rotation={[0.5, 0, 0]} castShadow>
                        <boxGeometry args={[0.15, 0.4, 0.1]} />
                        <meshStandardMaterial color={hairColor} />
                     </mesh>
                )}
                {hairStyle === 'BUNS' && (
                    <>
                        <mesh position={[-0.2, 0.2, 0]} castShadow><sphereGeometry args={[0.12]} /><meshStandardMaterial color={hairColor} /></mesh>
                        <mesh position={[0.2, 0.2, 0]} castShadow><sphereGeometry args={[0.12]} /><meshStandardMaterial color={hairColor} /></mesh>
                    </>
                )}
                {hairStyle === 'BOB' && (
                    <mesh position={[0, -0.2, 0.05]} castShadow><boxGeometry args={[0.42, 0.3, 0.35]} /><meshStandardMaterial color={hairColor} /></mesh>
                )}
                {hairStyle === 'LONG' && (
                     <mesh position={[0, -0.4, -0.05]} castShadow><boxGeometry args={[0.42, 0.8, 0.1]} /><meshStandardMaterial color={hairColor} /></mesh>
                )}
            </group>

            {/* Earrings */}
            {hasEarrings && (
                <>
                    <mesh position={[-0.18, -0.05, 0]}><sphereGeometry args={[0.02]} /><meshStandardMaterial color="gold" /></mesh>
                    <mesh position={[0.18, -0.05, 0]}><sphereGeometry args={[0.02]} /><meshStandardMaterial color="gold" /></mesh>
                </>
            )}
        </group>

        {/* --- TORSO --- */}
        <group position={[0, 1.1, 0]}>
            {/* Neck */}
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.2]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>

            {/* Necklace */}
            {hasNecklace && (
                 <mesh position={[0, 0.2, 0]} rotation={[1.6, 0, 0]}>
                    <torusGeometry args={[0.07, 0.01, 8, 16]} />
                    <meshStandardMaterial color="gold" />
                 </mesh>
            )}

            {/* Main Body */}
            <mesh castShadow>
                <boxGeometry args={[0.3, 0.45, 0.15]} />
                <meshStandardMaterial color={topType === 'TSHIRT' ? topColor : topColor} />
            </mesh>
            
            {/* Jacket Overlay */}
            {topType === 'JACKET' && (
                 <group>
                    <mesh position={[0, 0, -0.02]} castShadow>
                        <boxGeometry args={[0.32, 0.46, 0.16]} />
                        <meshStandardMaterial color={topColor} />
                    </mesh>
                    {/* Open front look using two side panels */}
                    <mesh position={[-0.08, 0, 0.08]} castShadow>
                        <boxGeometry args={[0.14, 0.46, 0.02]} />
                        <meshStandardMaterial color={topColor} />
                    </mesh>
                    <mesh position={[0.08, 0, 0.08]} castShadow>
                        <boxGeometry args={[0.14, 0.46, 0.02]} />
                        <meshStandardMaterial color={topColor} />
                    </mesh>
                    {/* Inner Shirt visible in center */}
                    <mesh position={[0, 0, 0.075]}>
                        <planeGeometry args={[0.1, 0.4]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                 </group>
            )}
        </group>

        {/* --- ARMS --- */}
        {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.22, 1.25, 0]} rotation={[0, 0, side * -0.1]}>
                {/* Shoulder */}
                <mesh>
                    <sphereGeometry args={[0.07]} />
                    <meshStandardMaterial color={topColor} />
                </mesh>
                
                {/* Upper Arm */}
                <mesh position={[0, -0.15, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.3]} />
                    <meshStandardMaterial color={topType === 'JACKET' ? topColor : skinColor} />
                </mesh>
                
                {/* Elbow Joint (Visible Knuckle) */}
                <mesh position={[0, -0.3, 0]}>
                    <sphereGeometry args={[0.055]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>

                {/* Lower Arm */}
                <mesh position={[0, -0.45, 0]}>
                    <cylinderGeometry args={[0.045, 0.04, 0.3]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>

                {/* Wrist/Bracelets */}
                {hasBracelets && (
                    <mesh position={[0, -0.58, 0]}>
                        <torusGeometry args={[0.05, 0.01, 8, 16]} rotation={[1.6, 0, 0]} />
                        <meshStandardMaterial color="silver" />
                    </mesh>
                )}

                {/* Hand - Palm & Knuckles */}
                <group position={[0, -0.65, 0]}>
                     <mesh>
                        <boxGeometry args={[0.08, 0.08, 0.03]} />
                        <meshStandardMaterial color={skinColor} />
                     </mesh>
                     {/* Fingers */}
                     <group position={[0, -0.05, 0]}>
                        {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
                            <mesh key={i} position={[x, -0.02, 0]}>
                                <boxGeometry args={[0.015, 0.05, 0.015]} />
                                <meshStandardMaterial color={skinColor} />
                            </mesh>
                        ))}
                     </group>
                     {/* Ring */}
                     {hasRing && side === 1 && (
                         <mesh position={[0.03, -0.06, 0]}>
                            <boxGeometry args={[0.02, 0.01, 0.02]} />
                            <meshStandardMaterial color="gold" />
                         </mesh>
                     )}
                </group>
            </group>
        ))}

        {/* --- LEGS & LOWER BODY --- */}
        <group position={[0, 0.88, 0]}>
             {/* Hips/Pelvis */}
             <mesh>
                 <boxGeometry args={[0.28, 0.15, 0.14]} />
                 <meshStandardMaterial color={bottomType === 'SKIRT' ? bottomColor : bottomColor} />
             </mesh>

             {/* Skirt Option */}
             {bottomType === 'SKIRT' && (
                 <mesh position={[0, -0.2, 0]}>
                     <coneGeometry args={[0.3, 0.4, 32, 1, true]} />
                     <meshStandardMaterial color={bottomColor} side={2} />
                 </mesh>
             )}

             {/* Legs */}
             {[-1, 1].map((side) => (
                 <group key={side} position={[side * 0.08, -0.1, 0]}>
                     {/* Upper Leg */}
                     <mesh position={[0, -0.15, 0]}>
                         <cylinderGeometry args={[0.07, 0.06, 0.3]} />
                         <meshStandardMaterial color={bottomType === 'PANTS_LONG' || bottomType === 'PANTS_SHORT' || bottomType === 'SHORTS' ? bottomColor : skinColor} />
                     </mesh>

                     {/* Knee Joint (Visible) */}
                     <mesh position={[0, -0.32, 0.02]}>
                         <sphereGeometry args={[0.06]} />
                         <meshStandardMaterial color={skinColor} />
                     </mesh>

                     {/* Lower Leg */}
                     <mesh position={[0, -0.5, 0]}>
                         <cylinderGeometry args={[0.06, 0.05, 0.35]} />
                         <meshStandardMaterial color={bottomType === 'PANTS_LONG' ? bottomColor : skinColor} />
                     </mesh>

                     {/* Socks */}
                     <mesh position={[0, -0.6, 0]}>
                          <cylinderGeometry args={[0.055, 0.05, 0.1]} />
                          <meshStandardMaterial color={sockColor} />
                     </mesh>

                     {/* Feet */}
                     <group position={[0, -0.7, 0.05]}>
                         {/* Ankle */}
                         <mesh position={[0, 0.05, -0.05]}>
                             <sphereGeometry args={[0.05]} />
                             <meshStandardMaterial color={sockColor} />
                         </mesh>
                         
                         {/* Shoe/Foot Main */}
                         <mesh position={[0, 0, 0]}>
                             <boxGeometry args={[0.08, 0.05, 0.15]} />
                             <meshStandardMaterial color={shoeColor} />
                         </mesh>
                         
                         {/* Shoe Sole */}
                         <mesh position={[0, -0.03, 0]}>
                             <boxGeometry args={[0.085, 0.01, 0.155]} />
                             <meshStandardMaterial color="#333" />
                         </mesh>

                         {/* Toes (If no shoes? Assuming shoes mostly, but let's define the shape) */}
                         <mesh position={[0, 0, 0.08]}>
                              <boxGeometry args={[0.08, 0.04, 0.05]} />
                              <meshStandardMaterial color={shoeColor} />
                         </mesh>
                     </group>
                 </group>
             ))}
        </group>

    </group>
  );
};

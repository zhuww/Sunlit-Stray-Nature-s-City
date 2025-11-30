
import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, ContactShadows, OrbitControls } from '@react-three/drei';
import { PlayerAvatar } from '../Player/PlayerAvatar';
import { CharacterAppearance, HairStyle, ClothingTop, ClothingBottom, EyebrowStyle } from '../../types';
import { Check, ChevronRight } from 'lucide-react';

interface CharacterCustomizerProps {
  appearance: CharacterAppearance;
  setAppearance: (a: CharacterAppearance) => void;
  onConfirm: () => void;
}

const RotatingPlayer: React.FC<{ appearance: CharacterAppearance }> = ({ appearance }) => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
    });
    return (
        <group ref={group} position={[0, -1, 0]} scale={[2, 2, 2]}>
            <PlayerAvatar appearance={appearance} />
        </group>
    );
};

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({ appearance, setAppearance, onConfirm }) => {
  
  // Section rendering helper
  const renderColorSection = (title: string, current: string, onChange: (c: string) => void, colors: string[]) => (
      <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">{title}</h3>
          <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                  <button
                      key={color}
                      onClick={() => onChange(color)}
                      className={`w-8 h-8 rounded-full border-2 ${current === color ? 'border-pink-500 scale-110 shadow-md' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                  />
              ))}
          </div>
      </div>
  );

  const renderSelect = (title: string, options: string[], current: string, onChange: (v: any) => void) => (
       <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">{title}</h3>
          <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                  <button 
                      key={opt}
                      onClick={() => onChange(opt)}
                      className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                          current === opt 
                          ? 'bg-pink-100 border-pink-500 text-pink-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'
                      }`}
                  >
                      {opt.replace('_', ' ')}
                  </button>
              ))}
          </div>
      </div>
  );

  const renderToggle = (title: string, checked: boolean, onChange: (v: boolean) => void) => (
      <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">{title}</span>
          <button 
            onClick={() => onChange(!checked)}
            className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-pink-500' : 'bg-gray-300'}`}
          >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${checked ? 'left-6' : 'left-1'}`} />
          </button>
      </div>
  );

  return (
    <div className="w-full h-full relative bg-slate-900 flex">
        {/* 3D Preview */}
        <div className="flex-grow relative">
             <Canvas shadows camera={{ position: [0, 1, 4], fov: 45 }}>
                <Sky sunPosition={[10, 20, 10]} />
                <ambientLight intensity={0.7} />
                <directionalLight position={[2, 5, 5]} intensity={1.2} castShadow />
                <ContactShadows resolution={1024} scale={10} blur={1} opacity={0.5} far={10} color="#000000" />
                
                {/* Platform */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
                    <cylinderGeometry args={[2, 2, 0.1, 32]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>

                <RotatingPlayer appearance={appearance} />
                <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} target={[0, 0, 0]} />
            </Canvas>
        </div>

        {/* Customization Panel */}
        <div className="w-96 bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 bg-pink-50 border-b border-pink-100">
                <h2 className="text-2xl font-bold text-slate-800">Studio</h2>
                <p className="text-slate-500 text-sm">Design your unique look</p>
            </div>
            
            <div className="p-6 flex-grow">
                {/* --- HEAD & FACE --- */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Face & Hair</h2>
                    
                    {renderSelect("Hair Style", ['PONYTAIL', 'BOB', 'LONG', 'BUNS'], appearance.hairStyle, (v) => setAppearance({...appearance, hairStyle: v}))}
                    {renderColorSection("Hair Color", appearance.hairColor, (v) => setAppearance({...appearance, hairColor: v}), ['#1a1a1a', '#5d4037', '#8b4513', '#eab308', '#fca5a5', '#ffffff', '#9ca3af'])}
                    {renderColorSection("Skin Color", appearance.skinColor, (v) => setAppearance({...appearance, skinColor: v}), ['#fce7f3', '#ffdbac', '#e0ac69', '#8d5524', '#3e2723'])}
                    {renderColorSection("Eye Color", appearance.eyeColor, (v) => setAppearance({...appearance, eyeColor: v}), ['#3b82f6', '#22c55e', '#78350f', '#000000', '#9333ea'])}
                    {renderColorSection("Lip Color", appearance.lipColor, (v) => setAppearance({...appearance, lipColor: v}), ['#fca5a5', '#ef4444', '#be185d', '#ffdbac', '#7f1d1d'])}
                    {renderSelect("Eyebrows", ['ARCHED', 'FLAT', 'ROUND'], appearance.eyebrowStyle, (v) => setAppearance({...appearance, eyebrowStyle: v}))}
                </div>

                {/* --- OUTFIT --- */}
                <div className="mb-8">
                     <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Outfit</h2>
                     
                     {renderSelect("Top Style", ['TSHIRT', 'JACKET'], appearance.topType, (v) => setAppearance({...appearance, topType: v}))}
                     {renderColorSection("Top Color", appearance.topColor, (v) => setAppearance({...appearance, topColor: v}), ['#ffffff', '#1f2937', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'])}
                     
                     {renderSelect("Bottom Style", ['SKIRT', 'SHORTS', 'PANTS_LONG', 'PANTS_SHORT'], appearance.bottomType, (v) => setAppearance({...appearance, bottomType: v}))}
                     {renderColorSection("Bottom Color", appearance.bottomColor, (v) => setAppearance({...appearance, bottomColor: v}), ['#374151', '#1e40af', '#047857', '#b91c1c', '#db2777', '#fcd34d'])}
                </div>

                {/* --- FEET --- */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Shoes & Socks</h2>
                    {renderColorSection("Sock Color", appearance.sockColor, (v) => setAppearance({...appearance, sockColor: v}), ['#ffffff', '#000000', '#fb7185', '#93c5fd'])}
                    {renderColorSection("Shoe Color", appearance.shoeColor, (v) => setAppearance({...appearance, shoeColor: v}), ['#1f2937', '#ffffff', '#7f1d1d', '#92400e'])}
                </div>

                {/* --- ACCESSORIES --- */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Accessories</h2>
                    {renderToggle("Necklace", appearance.hasNecklace, (v) => setAppearance({...appearance, hasNecklace: v}))}
                    {renderToggle("Earrings", appearance.hasEarrings, (v) => setAppearance({...appearance, hasEarrings: v}))}
                    {renderToggle("Bracelets", appearance.hasBracelets, (v) => setAppearance({...appearance, hasBracelets: v}))}
                    {renderToggle("Ring", appearance.hasRing, (v) => setAppearance({...appearance, hasRing: v}))}
                </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button 
                    onClick={onConfirm}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
                >
                    <Check className="w-6 h-6" /> Start Game
                </button>
            </div>
        </div>
    </div>
  );
};

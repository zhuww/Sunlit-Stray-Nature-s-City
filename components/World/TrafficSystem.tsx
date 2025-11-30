
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CITY_SIZE, TILE_SIZE } from './CityBuilder';

const CAR_COUNT = 15;

interface TrafficSystemProps {
    timeOfDay: number;
}

export const TrafficSystem: React.FC<TrafficSystemProps> = ({ timeOfDay }) => {
    
    const cars = useMemo(() => {
        const items = [];
        for (let i = 0; i < CAR_COUNT; i++) {
            const isHorizontal = Math.random() > 0.5;
            const laneIndex = Math.floor(Math.random() * (CITY_SIZE/2)) * 2 - (CITY_SIZE/2);
            
            // 20% Chance for Garbage Truck
            const isTruck = Math.random() > 0.8;

            items.push({
                id: i,
                isHorizontal,
                lane: laneIndex * TILE_SIZE,
                offset: (Math.random() - 0.5) * (CITY_SIZE * TILE_SIZE),
                speed: (Math.random() * 5 + 5) * (Math.random() > 0.5 ? 1 : -1) * (isTruck ? 0.6 : 1),
                color: ['#ef4444', '#3b82f6', '#eab308', '#ffffff'][Math.floor(Math.random()*4)],
                isTruck
            });
        }
        return items;
    }, []);

    const group = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (!group.current) return;
        
        group.current.children.forEach((mesh, i) => {
            const car = cars[i];
            const limit = (CITY_SIZE * TILE_SIZE) / 2;

            if (car.isHorizontal) {
                mesh.position.x += car.speed * delta;
                if (mesh.position.x > limit) mesh.position.x = -limit;
                if (mesh.position.x < -limit) mesh.position.x = limit;
            } else {
                mesh.position.z += car.speed * delta;
                if (mesh.position.z > limit) mesh.position.z = -limit;
                if (mesh.position.z < -limit) mesh.position.z = limit;
            }
        });
    });

    return (
        <group ref={group}>
            {cars.map((car, i) => (
                <group
                    key={i} 
                    position={[
                        car.isHorizontal ? car.offset : car.lane, 
                        0, 
                        car.isHorizontal ? car.lane : car.offset
                    ]}
                    rotation={[0, car.isHorizontal ? (car.speed > 0 ? 0 : Math.PI) : (car.speed > 0 ? -Math.PI/2 : Math.PI/2), 0]}
                >
                    {car.isTruck ? (
                        // GARBAGE TRUCK
                        <group position={[0, 1.5, 0]}>
                            {/* Cab */}
                            <mesh position={[1.5, -0.5, 0]} castShadow>
                                <boxGeometry args={[1.5, 1.5, 2.2]} />
                                <meshStandardMaterial color="#ffffff" />
                            </mesh>
                            {/* Compactor Body */}
                            <mesh position={[-1, 0, 0]} castShadow>
                                <boxGeometry args={[4, 2.5, 2.4]} />
                                <meshStandardMaterial color="#166534" />
                            </mesh>
                            {/* Wheels */}
                            <mesh position={[1.5, -1.2, 1]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[1.5, -1.2, -1]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[-2, -1.2, 1]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[-2, -1.2, -1]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 0.4]} /><meshStandardMaterial color="#111" /></mesh>
                        </group>
                    ) : (
                        // STANDARD CAR
                        <mesh 
                            position={[0, 0.75, 0]}
                            castShadow
                        >
                            <boxGeometry args={[2.5, 1.2, 1.2]} />
                            <meshStandardMaterial color={car.color} />
                            <mesh position={[0.8, 0.2, 0]}>
                                <boxGeometry args={[1, 1.3, 1.1]} />
                                <meshStandardMaterial color="#1e293b" />
                            </mesh>
                        </mesh>
                    )}
                </group>
            ))}
        </group>
    );
};





import React from 'react';
import { Position, Building } from '../../types';
import { CITY_SIZE, TILE_SIZE } from '../World/CityBuilder';

interface MinimapProps {
  playerPosition: Position;
  sanctuaryPosition: [number, number, number];
  allBuildings: Building[];
  ownedHouses: {position: Position}[];
  stores: Building[];
  recruitedStoreIds: string[];
  cemeteryPosition?: [number, number, number];
  rentalPosition?: [number, number, number];
  carWashPosition?: [number, number, number];
  carFactoryPosition?: [number, number, number];
  stStationPosition?: [number, number, number];
  msStationPosition?: [number, number, number];
  royalCarriagePosition?: [number, number, number];
  currentJob?: 'ST' | 'MS' | null;
}

export const Minimap: React.FC<MinimapProps> = ({ playerPosition, sanctuaryPosition, allBuildings, ownedHouses, stores, recruitedStoreIds, cemeteryPosition, rentalPosition, carWashPosition, carFactoryPosition, stStationPosition, msStationPosition, royalCarriagePosition, currentJob }) => {
  const mapSize = 150; // px
  const worldSize = CITY_SIZE * TILE_SIZE + 20;

  const worldToMap = (val: number) => {
      // Map [-worldSize/2, worldSize/2] to [0, mapSize]
      return ((val + worldSize/2) / worldSize) * mapSize;
  };

  return (
    <div 
        className="absolute bottom-4 right-4 bg-slate-900/90 border-2 border-slate-600 rounded-lg overflow-hidden shadow-2xl z-50"
        style={{ width: mapSize, height: mapSize }}
    >
        {/* All Houses (White Dots) */}
        {allBuildings.filter(b => b.type.includes('HOUSE')).map((h) => (
            <div 
                key={h.id}
                className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-60"
                style={{ 
                    left: worldToMap(h.position[0]) - 3, 
                    top: worldToMap(h.position[2]) - 3 
                }}
            />
        ))}

        {/* NPC Occupied Houses (Pink Dots) */}
        {allBuildings.filter(b => b.type.includes('HOUSE') && b.isOccupied && !b.isOwned).map((h) => (
            <div 
                key={`occ-${h.id}`}
                className="absolute w-2 h-2 bg-pink-500 rounded-full border border-pink-300"
                style={{ 
                    left: worldToMap(h.position[0]) - 4, 
                    top: worldToMap(h.position[2]) - 4 
                }}
            />
        ))}

        {/* Owned Houses (Green Dots - distinct from NPC) */}
        {ownedHouses.map((h, i) => (
            <div 
                key={`owned-${i}`}
                className="absolute w-2.5 h-2.5 bg-green-500 rounded-full border border-white z-10"
                style={{ 
                    left: worldToMap(h.position[0]) - 5, 
                    top: worldToMap(h.position[2]) - 5 
                }}
            />
        ))}

        {/* Sanctuary (Blue Dot) */}
        <div 
            className="absolute w-3 h-3 bg-blue-500 rounded-full border border-white"
            style={{ 
                left: worldToMap(sanctuaryPosition[0]) - 6, 
                top: worldToMap(sanctuaryPosition[2]) - 6 
            }}
        />
        
        {/* Cemetery (Gray Dot) */}
        {cemeteryPosition && (
            <div 
                className="absolute w-3 h-3 bg-gray-500 rounded-full border border-gray-300"
                style={{ 
                    left: worldToMap(cemeteryPosition[0]) - 6, 
                    top: worldToMap(cemeteryPosition[2]) - 6 
                }}
            />
        )}

        {/* Rental (Green Dot) */}
        {rentalPosition && (
             <div 
                className="absolute w-3 h-3 bg-green-500 rounded-full border border-white"
                style={{ 
                    left: worldToMap(rentalPosition[0]) - 6, 
                    top: worldToMap(rentalPosition[2]) - 6 
                }}
            />
        )}

        {/* Car Wash (Cyan Dot) */}
        {carWashPosition && (
             <div 
                className="absolute w-3 h-3 bg-cyan-400 rounded-full border border-white"
                style={{ 
                    left: worldToMap(carWashPosition[0]) - 6, 
                    top: worldToMap(carWashPosition[2]) - 6 
                }}
            />
        )}

        {/* Car Factory (Purple Dot) */}
        {carFactoryPosition && (
             <div 
                className="absolute w-3.5 h-3.5 bg-purple-600 rounded-full border border-white"
                style={{ 
                    left: worldToMap(carFactoryPosition[0]) - 7, 
                    top: worldToMap(carFactoryPosition[2]) - 7 
                }}
            />
        )}

        {/* Royal Carriage (Pink Dot) */}
        {royalCarriagePosition && (
             <div 
                className="absolute w-4 h-4 bg-pink-500 rounded-full border-2 border-white animate-pulse z-40"
                style={{ 
                    left: worldToMap(royalCarriagePosition[0]) - 8, 
                    top: worldToMap(royalCarriagePosition[2]) - 8 
                }}
            />
        )}

        {/* ST Station (Red Dot - Only if Job Active) */}
        {stStationPosition && currentJob === 'ST' && (
             <div 
                className="absolute w-4 h-4 bg-red-600 rounded-full border-2 border-white animate-pulse z-30"
                style={{ 
                    left: worldToMap(stStationPosition[0]) - 8, 
                    top: worldToMap(stStationPosition[2]) - 8 
                }}
            />
        )}

         {/* MS Station (Brown Dot - Only if Job Active) */}
         {msStationPosition && currentJob === 'MS' && (
             <div 
                className="absolute w-4 h-4 bg-amber-800 rounded-full border-2 border-white animate-pulse z-30"
                style={{ 
                    left: worldToMap(msStationPosition[0]) - 8, 
                    top: worldToMap(msStationPosition[2]) - 8 
                }}
            />
        )}

        {/* Stores (Yellow = POI, Purple = Owned) */}
        {stores.map((s, i) => (
            <div 
                key={s.id}
                className={`absolute w-2.5 h-2.5 rounded-full ${s.isOwned ? 'bg-purple-500 border-white' : 'bg-yellow-400 border-black'} `}
                style={{ 
                    left: worldToMap(s.position[0]) - 5, 
                    top: worldToMap(s.position[2]) - 5 
                }}
            />
        ))}

        {/* Player (Arrow) */}
        <div 
            className="absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white z-20"
            style={{ 
                left: worldToMap(playerPosition[0]) - 6, 
                top: worldToMap(playerPosition[2]) - 5,
                transform: `rotate(0deg)` 
            }}
        />
    </div>
  );
};

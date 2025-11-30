
import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, SoftShadows, ContactShadows, OrbitControls } from '@react-three/drei';
import { generateCity, CityInstances, generateNPCs } from './components/World/CityBuilder';
import { PlayerController } from './components/Player/PlayerController';
import { PetFollower } from './components/Player/PetFollower';
import { TrafficSystem } from './components/World/TrafficSystem';
import { Minimap } from './components/UI/Minimap';
import { HomeScene } from './components/World/HomeScene';
import { FriendHouseScene } from './components/World/FriendHouseScene';
import { STStationScene } from './components/World/STStationScene';
import { MSStationScene } from './components/World/MSStationScene';
import { RoyalChamberScene } from './components/World/RoyalChamberScene';
import { CharacterCustomizer } from './components/UI/CharacterCustomizer';
import { PetAdoptionModal } from './components/UI/PetAdoptionModal';
import { CarRentalModal } from './components/UI/CarRentalModal';
import { CarFactoryModal } from './components/UI/CarFactoryModal';
import { GameState, RegionType, Building, PET_PRICES, CharacterAppearance, Pet, PetType, PetAccessories, Vehicle, NPC, STORE_PRICE } from './types';
import { generateHotelStory } from './services/geminiService';
import { Clock, Coins, MapPin, Home, Briefcase, UserPlus, LogOut, Heart, Hand, Car, Droplets, Factory, Wrench, ShoppingCart, X, Users, Store, Phone, Calendar, Target, ShieldAlert, Crown } from 'lucide-react';
import * as THREE from 'three';
import { NPCSystem } from './components/World/NPCSystem';
import { PlayerAvatar } from './components/Player/PlayerAvatar'; 
import { PetAvatar } from './components/Player/PetAvatar';

const START_MONEY = 500;
const START_TIME = 420; // 7:00 AM
const CHECKOUT_DAY = 17;

const DEFAULT_APPEARANCE: CharacterAppearance = {
    hairStyle: 'PONYTAIL',
    hairColor: '#5d4037',
    skinColor: '#ffdbac',
    eyeColor: '#3b82f6',
    eyebrowStyle: 'ARCHED',
    lipColor: '#fca5a5',
    topType: 'TSHIRT',
    topColor: '#ec4899',
    bottomType: 'SKIRT',
    bottomColor: '#f472b6',
    sockColor: '#ffffff',
    shoeColor: '#1f2937',
    hasNecklace: false,
    hasEarrings: false,
    hasBracelets: false,
    hasRing: false
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'REGION_SELECT',
    region: 'RIVERSIDE',
    money: START_MONEY,
    parts: 100, 
    timeOfDay: START_TIME, 
    message: null,
    dayCount: 1,
    pets: [],
    friends: [],
    npcs: [], 
    followingFriendId: null,
    visitingFriendId: null,
    ownedHouseIds: [],
    recruitedBuildingIds: [],
    furniture: [], 
    playerPosition: [0, 0, 0],
    rentPaidToday: true,
    storyMode: false,
    mood: 'BORED', 
    appearance: DEFAULT_APPEARANCE,
    vehicle: null,
    vehicleInventory: [],
    currentJob: null,
    capturedCount: 0,
    prisonerCount: 0,
    hasRoyalSystem: false
  });

  const [cityData, setCityData] = useState<any>(null);
  const [nearbyBuilding, setNearbyBuilding] = useState<Building | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [adoptionType, setAdoptionType] = useState<PetType | null>(null); 
  const [showCarRental, setShowCarRental] = useState(false);
  const [showCarFactory, setShowCarFactory] = useState(false);
  const [isWashing, setIsWashing] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [viewingFriend, setViewingFriend] = useState<NPC | null>(null); 

  // Lighting State
  const isNight = gameState.timeOfDay >= 1200 || gameState.timeOfDay < 240; // 8PM - 4AM

  const handleSelectRegion = (region: RegionType) => {
      const city = generateCity(region);
      let initialNPCs = generateNPCs(25); 
      const occupiedHouses = city.buildings.filter(b => b.isOccupied);
      const humanNPCs = initialNPCs.filter(n => n.type === 'HUMAN');
      humanNPCs.forEach((npc, index) => {
          if (index < occupiedHouses.length) {
              const house = occupiedHouses[index];
              house.occupiedById = npc.id;
              npc.homeBuildingId = house.id;
          }
      });
      initialNPCs = initialNPCs.map(n => humanNPCs.find(h => h.id === n.id) || n);
      setCityData(city);
      setGameState(prev => ({ 
          ...prev, 
          phase: 'CHARACTER_SELECT', 
          region, 
          npcs: initialNPCs 
        }));
  };

  const handleCharacterConfirmed = () => {
      setGameState(prev => ({ ...prev, phase: 'PLAYING', timeOfDay: START_TIME, mood: 'EXCITED' }));
  };

  useEffect(() => {
      if (gameState.phase === 'REGION_SELECT' || gameState.phase === 'CHARACTER_SELECT' || gameState.phase === 'JAIL_VIEW' || gameState.dayCount >= CHECKOUT_DAY) return;

      const interval = setInterval(() => {
          setGameState(prev => {
              const timeSpeed = isWorking ? 10 : 5;
              const nextTime = (prev.timeOfDay + timeSpeed) % 1440;
              let { dayCount, rentPaidToday, money, message, mood, parts } = prev;

              if (isWorking && nextTime >= 840 && prev.timeOfDay < 840) {
                  setIsWorking(false);
                  parts += 200; 
                  message = "Work finished! Earned 200 Parts.";
                  mood = 'SLEEPY'; 
                  return { 
                      ...prev, 
                      timeOfDay: 840, 
                      money,
                      parts, 
                      message, 
                      mood,
                      playerPosition: cityData?.ventPosition || [0,0,0],
                      phase: 'PLAYING' 
                  };
              }

              if (nextTime < prev.timeOfDay) {
                  dayCount++;
                  rentPaidToday = false;
              }

              if (nextTime >= 420 && prev.timeOfDay < 420 && !rentPaidToday) {
                   const rent = 20 * prev.ownedHouseIds.length;
                   if (rent > 0) {
                       money = Math.max(0, money - rent);
                       message = `Paid ${rent} units rent to the Landlord for furniture and maintenance.`;
                       mood = money < 50 ? 'LACK_CONFIDENCE' : 'DISCOMFORT'; 
                   }
                   rentPaidToday = true;
              }

              return { ...prev, timeOfDay: nextTime, dayCount, rentPaidToday, money, parts, message, mood };
          });
      }, isWorking ? 50 : 1000); 

      return () => clearInterval(interval);
  }, [gameState.phase, isWorking, cityData, gameState.dayCount]);

  const handleInteraction = async () => {
      if (!nearbyBuilding || isWorking) return;
      if ((nearbyBuilding.type.includes('HOUSE') || nearbyBuilding.type === 'STORE') && !gameState.ownedHouseIds.includes(nearbyBuilding.id)) {
          const price = nearbyBuilding.price || 0;
          if (gameState.money >= price) {
              setGameState(prev => ({
                  ...prev,
                  money: prev.money - price,
                  ownedHouseIds: [...prev.ownedHouseIds, nearbyBuilding.id],
                  message: `You bought a ${nearbyBuilding.type === 'STORE' ? 'Company Store' : 'House'}!`,
                  mood: 'EXCITED' 
              }));
          } else {
              setGameState(prev => ({ ...prev, message: `Not enough money! Need ${price}.`, mood: 'LACK_CONFIDENCE' }));
          }
      }
      if (nearbyBuilding.type === 'HOTEL') {
          setGameState(prev => ({ ...prev, message: "Listening to the hotel owner...", mood: 'FOCUSED' }));
          const story = await generateHotelStory("Grand Riverside Hotel", gameState.region);
          setGameState(prev => ({ ...prev, message: story, storyMode: true }));
          setTimeout(() => setGameState(prev => ({ ...prev, storyMode: false })), 8000);
      }
  };

  const initiateAdoption = (type: PetType) => {
      setAdoptionType(type);
  };

  const confirmAdoption = (breed: string, accessories: PetAccessories) => {
      if (!adoptionType) return;
      const price = PET_PRICES[adoptionType];
      if (gameState.money >= price) {
          setGameState(prev => ({
              ...prev,
              money: prev.money - price,
              pets: [...prev.pets, { 
                  id: Date.now().toString(), 
                  type: adoptionType, 
                  name: adoptionType,
                  breed,
                  accessories
              }],
              message: `You adopted a ${adoptionType}!`,
              mood: 'EXCITED'
          }));
          setAdoptionType(null); 
      } else {
          setGameState(prev => ({ ...prev, message: "Too expensive!", mood: 'EMBARRASSED' }));
      }
  };

  const handleRentCar = (vehicleConfig: Omit<Vehicle, 'id'>) => {
      const RENTAL_COST = 50;
      if (gameState.money >= RENTAL_COST) {
          const newVehicle: Vehicle = { ...vehicleConfig, id: Date.now().toString() };
          setGameState(prev => ({
              ...prev,
              money: prev.money - RENTAL_COST,
              vehicleInventory: [...prev.vehicleInventory, newVehicle],
              message: "Car rented! Added to Shopping Cart.",
              mood: 'EXCITED'
          }));
          setShowCarRental(false);
          setShowCart(true); 
      } else {
          setGameState(prev => ({ ...prev, message: "Not enough money to rent a car!", mood: 'LACK_CONFIDENCE' }));
      }
  };

  const handleBuildCar = (vehicleConfig: Omit<Vehicle, 'id'>) => {
      const PARTS_COST = 80;
      if (gameState.parts >= PARTS_COST) {
           const newVehicle: Vehicle = { ...vehicleConfig, id: Date.now().toString() };
           setGameState(prev => ({
               ...prev,
               parts: prev.parts - PARTS_COST,
               vehicleInventory: [...prev.vehicleInventory, newVehicle],
               message: "Car Assembled! Added to Shopping Cart.",
               mood: 'EXCITED'
           }));
           setShowCarFactory(false);
           setShowCart(true); 
      }
  };

  // Job Logic
  const handleSelectJob = (job: 'ST' | 'MS') => {
      setGameState(prev => ({
          ...prev,
          currentJob: job,
          message: `${job} Job Selected! Go to the marked station on the map.`,
          mood: 'FOCUSED'
      }));
  };

  const handleEnterSTStation = () => {
      setGameState(prev => ({
          ...prev,
          phase: 'ST_STATION_VIEW',
          playerPosition: [0,0,0],
          message: "16:17 - Entered ST Garage. The team is waiting."
      }));
  };

  const handleEnterMSStation = () => {
    setGameState(prev => ({
        ...prev,
        phase: 'MS_STATION_VIEW',
        playerPosition: [0,0,0],
        message: "Entered MS Station. Prepare for prisoner transport."
    }));
};

  const handleEnterRoyalCarriage = () => {
      setGameState(prev => ({
          ...prev,
          phase: 'ROYAL_CHAMBER_VIEW',
          playerPosition: [0,0,0],
          message: "Entering the Royal Carriage..."
      }));
  };

  const handleGetRoyalSystem = () => {
      const goldenCarriage: Vehicle = {
          id: `gold-${Date.now()}`,
          style: 'SPORTS', // Using sports chassis for now, typically unique
          color: 'gold',
          isMissionVehicle: false
      };
      setGameState(prev => ({
          ...prev,
          hasRoyalSystem: true,
          vehicleInventory: [...prev.vehicleInventory, goldenCarriage],
          message: "System Acquired: Golden Carriage added to inventory!",
          mood: 'EXCITED'
      }));
  };

  const handleStartPatrol = (vehicleConfig: Omit<Vehicle, 'id'>) => {
       const newVehicle: Vehicle = { ...vehicleConfig, id: Date.now().toString() };
       const exitPos = gameState.phase === 'MS_STATION_VIEW' ? cityData.msStationPosition : cityData.stStationPosition;
       setGameState(prev => ({
           ...prev,
           vehicleInventory: [...prev.vehicleInventory, newVehicle],
           vehicle: newVehicle, // Auto equip
           phase: 'PLAYING',
           playerPosition: exitPos, // Exit outside
           message: "Patrol started. Find targets on the street!",
           mood: 'FOCUSED'
       }));
  };

  const toggleDriving = (vehicle: Vehicle) => {
      setGameState(prev => {
          if (prev.vehicle && prev.vehicle.id === vehicle.id) {
              return { ...prev, vehicle: null, message: "Car parked.", mood: 'FOCUSED' };
          }
          return { ...prev, vehicle: vehicle, message: "Driving " + vehicle.style, mood: 'EXCITED' };
      });
      setShowCart(false); 
  };

  const handleCarWash = () => {
      if (!gameState.vehicle) return;
      const WASH_COST = 10;
      if (gameState.money < WASH_COST) return;
      setIsWashing(true);
      setGameState(prev => ({
          ...prev,
          money: prev.money - WASH_COST,
          message: "Washing car...",
          mood: 'FOCUSED'
      }));
      setTimeout(() => {
          setIsWashing(false);
          setGameState(prev => ({ ...prev, message: "Car is clean!", mood: 'EXCITED' }));
      }, 3000);
  };

  const handleRecruit = (buildingId: string) => {
      if (!gameState.recruitedBuildingIds.includes(buildingId)) {
          setGameState(prev => ({
              ...prev,
              recruitedBuildingIds: [...prev.recruitedBuildingIds, buildingId],
              message: "You recruited a new pack member!",
              mood: 'FOCUSED'
          }));
      }
  };

  const startWork = () => {
      if (gameState.timeOfDay >= 840) return;
      setIsWorking(true);
      setGameState(prev => ({ ...prev, message: "Working... Earning parts!", mood: 'FOCUSED' }));
  };

  const handleReturnHome = () => {
      setGameState(prev => ({
          ...prev,
          phase: 'HOME_VIEW',
          playerPosition: [0, 0, 0], 
          message: gameState.furniture.length > 0 ? "Welcome home!" : "Welcome!",
          mood: 'EXCITED', 
          vehicle: null 
      }));
  };

  const handleExitHome = () => {
      let spawnPos = [0,0,0];
      if (gameState.phase === 'HOME_VIEW') {
          const ownedHouses = cityData.buildings.filter((b: Building) => gameState.ownedHouseIds.includes(b.id) && b.type.includes('HOUSE'));
          const homeBuilding = ownedHouses.length > 0 ? ownedHouses[0] : null;
          spawnPos = homeBuilding ? [homeBuilding.position[0], 0, homeBuilding.position[2] + 8] : [0,0,0];
      } else if (gameState.phase === 'FRIEND_HOUSE_VIEW' && gameState.visitingFriendId) {
           const friend = gameState.friends.find(f => f.id === gameState.visitingFriendId);
           if (friend && friend.homeBuildingId) {
               const house = cityData.buildings.find((b: Building) => b.id === friend.homeBuildingId);
               if (house) spawnPos = [house.position[0], 0, house.position[2] + 8];
           }
      } else if (gameState.phase === 'ST_STATION_VIEW') {
          spawnPos = cityData.stStationPosition;
      } else if (gameState.phase === 'MS_STATION_VIEW') {
          spawnPos = cityData.msStationPosition;
      } else if (gameState.phase === 'ROYAL_CHAMBER_VIEW') {
          spawnPos = cityData.royalCarriagePosition;
      }
      setGameState(prev => ({
          ...prev,
          phase: 'PLAYING',
          visitingFriendId: null,
          playerPosition: spawnPos as [number, number, number],
          message: "Exiting..."
      }));
  };

  const handleSleep = () => {
      setGameState(prev => {
          let newTime = prev.timeOfDay + 180; 
          let newDay = prev.dayCount;
          let newPaid = prev.rentPaidToday;
          if (newTime >= 1440) {
              newTime = newTime % 1440;
              newDay += 1;
              newPaid = false; 
          }
          return { ...prev, timeOfDay: newTime, dayCount: newDay, rentPaidToday: newPaid, mood: 'EXCITED', message: "Refreshed!" };
      });
  };

  const handleBuyFurniture = (id: string, price: number) => {
      if (gameState.money >= price) {
          setGameState(prev => ({
              ...prev,
              money: prev.money - price,
              furniture: [...prev.furniture, id],
              message: `Bought ${id}!`,
              mood: 'EXCITED'
          }));
      } else {
          setGameState(prev => ({ ...prev, message: "Not enough coins!", mood: 'LACK_CONFIDENCE' }));
      }
  };

  const handlePetClick = (petId: string) => setSelectedPetId(petId);

  const handleJailSpotted = () => {
      setGameState(prev => ({
          ...prev,
          phase: 'JAIL_VIEW',
          message: "You were seen! Royal Guards captured you.",
          mood: 'LACK_CONFIDENCE',
          vehicle: null // Car impounded
      }));
  };

  const handleNPCClick = (npc: NPC) => {
      // Logic for Friend or Capture
      
      // ST Job Capture
      if (gameState.currentJob === 'ST' && gameState.vehicle?.isMissionVehicle && npc.isShort) {
          setGameState(prev => ({
              ...prev,
              money: prev.money + 80, 
              capturedCount: prev.capturedCount + 1,
              message: `Captured Ghost Target! +80 Units`,
              mood: 'EXCITED',
              npcs: prev.npcs.filter(n => n.id !== npc.id) // Remove captured NPC
          }));
          return;
      }

      // MS Job Capture
      if (gameState.currentJob === 'MS' && gameState.vehicle?.isMissionVehicle && npc.isPrisoner) {
        setGameState(prev => ({
            ...prev,
            money: prev.money + 200, 
            prisonerCount: prev.prisonerCount + 1,
            message: `Captured Prisoner! +200 Units`,
            mood: 'EXCITED',
            npcs: prev.npcs.filter(n => n.id !== npc.id) // Remove captured NPC
        }));
        return;
      }

      // Add Friend Logic
      if (!npc.isShort && !npc.isPrisoner && !gameState.friends.some(f => f.id === npc.id)) {
          setGameState(prev => ({
              ...prev,
              friends: [...prev.friends, npc],
              npcs: prev.npcs.map(n => n.id === npc.id ? { ...n, isFriend: true } : n),
              message: `You became friends with ${npc.name}!`,
              mood: 'EXCITED'
          }));
      }
  };

  const performPetAction = (action: 'PET') => {
      if (!selectedPetId) return;
      setGameState(prev => ({
          ...prev,
          pets: prev.pets.map(p => p.id === selectedPetId ? { ...p, isHeld: true } : p),
          message: "Petting...",
          mood: 'EXCITED'
      }));
      setSelectedPetId(null);
  };

  const handleSummonFriend = (npc: NPC) => {
      setGameState(prev => ({ ...prev, followingFriendId: npc.id, message: `${npc.name} is following!`, mood: 'EXCITED' }));
      setViewingFriend(null); 
      setShowFriends(false);
  };

  const handleVisitFriendHouse = (friend: NPC) => {
      setGameState(prev => ({
          ...prev,
          phase: 'FRIEND_HOUSE_VIEW',
          visitingFriendId: friend.id,
          playerPosition: [0,0,0],
          message: `Entering ${friend.name}'s house...`,
          mood: 'EXCITED',
          vehicle: null
      }));
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h % 12 || 12}:${m < 10 ? '0' : ''}${m} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  if (gameState.phase === 'REGION_SELECT') {
      return (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white gap-8">
              <h1 className="text-4xl font-bold tracking-widest text-blue-400">SELECT REGION</h1>
              <div className="flex gap-4">
                  <button onClick={() => handleSelectRegion('RIVERSIDE')} className="w-48 h-64 bg-blue-600 hover:bg-blue-500 rounded-xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 shadow-xl">
                      <div className="w-24 h-24 bg-blue-300 rounded-full" />
                      <span className="text-xl font-bold">RIVERSIDE</span>
                  </button>
                  <button onClick={() => handleSelectRegion('DESERT')} className="w-48 h-64 bg-yellow-600 hover:bg-yellow-500 rounded-xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 shadow-xl">
                      <div className="w-24 h-24 bg-yellow-300 rounded-full" />
                      <span className="text-xl font-bold">DESERT</span>
                  </button>
                  <button onClick={() => handleSelectRegion('SWAMP')} className="w-48 h-64 bg-green-900 hover:bg-green-800 rounded-xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 shadow-xl">
                      <div className="w-24 h-24 bg-green-700 rounded-full" />
                      <span className="text-xl font-bold">SWAMP</span>
                  </button>
              </div>
          </div>
      );
  }

  if (gameState.phase === 'CHARACTER_SELECT') {
    return (
        <CharacterCustomizer 
            appearance={gameState.appearance} 
            setAppearance={(a) => setGameState(prev => ({ ...prev, appearance: a }))}
            onConfirm={handleCharacterConfirmed}
        />
    );
  }

  return (
    <div className="relative w-full h-full bg-black font-sans text-white select-none">
      <Canvas shadows camera={{ position: [0, 20, 20], fov: 50 }}>
        <SoftShadows />
        {/* Dynamic Lighting */}
        {!isNight && <Sky sunPosition={[10, 50, 10]} />}
        <ambientLight intensity={isNight ? 0.05 : 0.5} />
        <directionalLight 
            position={[50, 50, 20]} 
            intensity={isNight ? 0.1 : 1} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
        />
        {/* Night Fog for 'vague shapes' */}
        {isNight && <fog attach="fog" args={['#000000', 5, 25]} />}
        
        {/* CITY VIEW */}
        {gameState.phase === 'PLAYING' && cityData && (
            <>
                <CityInstances 
                    cityData={cityData} 
                    ownedHouses={gameState.ownedHouseIds} 
                    recruitedIds={gameState.recruitedBuildingIds}
                    region={gameState.region} 
                    onRecruit={handleRecruit}
                    onRent={() => setShowCarRental(true)}
                    onWash={handleCarWash}
                    onFactory={() => setShowCarFactory(true)}
                    onSTStation={handleEnterSTStation}
                    onMSStation={handleEnterMSStation}
                    onRoyalCarriage={handleEnterRoyalCarriage}
                    onWork={startWork}
                />
                <TrafficSystem timeOfDay={gameState.timeOfDay} />
                <NPCSystem 
                    npcs={gameState.npcs} 
                    onUpdate={(updated) => setGameState(prev => ({ ...prev, npcs: updated }))} 
                    onInteract={handleNPCClick}
                    onSpotted={handleJailSpotted}
                    followingFriendId={gameState.followingFriendId}
                    playerPosition={gameState.playerPosition}
                    timeOfDay={gameState.timeOfDay}
                    vehicle={gameState.vehicle}
                    hasRoyalSystem={gameState.hasRoyalSystem}
                />
                
                <PlayerController 
                    buildings={cityData.buildings} 
                    onPositionChange={(pos) => setGameState(prev => ({ ...prev, playerPosition: pos }))}
                    onInteract={setNearbyBuilding}
                    position={gameState.playerPosition}
                    isWorking={isWorking}
                    appearance={gameState.appearance}
                    vehicle={gameState.vehicle}
                />
                {gameState.pets.map((pet, index) => (
                    <PetFollower 
                        key={pet.id} 
                        pet={pet}
                        targetPosition={gameState.playerPosition} 
                        index={index}
                        onClick={handlePetClick}
                    />
                ))}
            </>
        )}

        {/* HOME VIEW */}
        {gameState.phase === 'HOME_VIEW' && (
            <HomeScene 
                onExit={handleExitHome} 
                onSleep={handleSleep}
                pets={gameState.pets} 
                playerPosition={gameState.playerPosition}
                onPositionChange={(pos) => setGameState(prev => ({ ...prev, playerPosition: pos }))}
                onMessage={(msg) => setGameState(prev => ({ ...prev, message: msg }))}
                appearance={gameState.appearance}
                onPetClick={handlePetClick}
                ownedFurniture={gameState.furniture}
                onBuyFurniture={handleBuyFurniture}
                money={gameState.money}
            />
        )}

        {/* FRIEND HOUSE VIEW */}
        {gameState.phase === 'FRIEND_HOUSE_VIEW' && (
            <FriendHouseScene 
                friend={gameState.friends.find(f => f.id === gameState.visitingFriendId) || null}
                onExit={handleExitHome}
                pets={gameState.pets}
                playerPosition={gameState.playerPosition}
                onPositionChange={(pos) => setGameState(prev => ({ ...prev, playerPosition: pos }))}
                appearance={gameState.appearance}
            />
        )}

        {/* ST STATION VIEW */}
        {gameState.phase === 'ST_STATION_VIEW' && (
            <STStationScene 
                onExit={handleExitHome}
                onBuyVehicle={handleStartPatrol}
                money={gameState.money}
            />
        )}

        {/* MS STATION VIEW */}
        {gameState.phase === 'MS_STATION_VIEW' && (
            <MSStationScene 
                onExit={handleExitHome}
                onBuyVehicle={handleStartPatrol}
            />
        )}

        {/* ROYAL CHAMBER VIEW */}
        {gameState.phase === 'ROYAL_CHAMBER_VIEW' && (
            <RoyalChamberScene 
                onExit={handleExitHome}
                onGetSystem={handleGetRoyalSystem}
                hasSystem={gameState.hasRoyalSystem}
                appearance={gameState.appearance}
            />
        )}

      </Canvas>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-40">
          <div className="flex gap-6 bg-black/40 backdrop-blur-sm p-2 rounded-lg pointer-events-auto">
              <div className="flex items-center gap-2 text-yellow-400">
                  <Clock className="w-6 h-6" />
                  <span className="text-2xl font-bold font-mono">{formatTime(gameState.timeOfDay)}</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                  <Calendar className="w-6 h-6" />
                  <div className="flex flex-col leading-tight">
                      <span className="text-sm font-bold uppercase">Checkout Date</span>
                      <span className="text-lg font-bold">Day {gameState.dayCount} / {CHECKOUT_DAY}</span>
                  </div>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                  <Coins className="w-6 h-6" />
                  <span className="text-2xl font-bold">{gameState.money} Units</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                  <Wrench className="w-6 h-6" />
                  <span className="text-2xl font-bold">{gameState.parts} Parts</span>
              </div>
          </div>
          
          <div className="flex gap-4">
               {gameState.hasRoyalSystem && (
                   <div className="bg-yellow-600 text-white p-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                        <Crown className="w-6 h-6" />
                        <span className="font-bold">ROYAL</span>
                   </div>
               )}
               <button 
                onClick={() => setShowFriends(!showFriends)}
                className="bg-pink-500 hover:bg-pink-400 text-white p-2 rounded-lg shadow-lg pointer-events-auto flex items-center gap-2"
              >
                  <Users className="w-6 h-6" />
                  <span className="font-bold">{gameState.friends.length} Friends</span>
              </button>
              <div className="flex items-center gap-2 text-pink-400 bg-black/40 backdrop-blur-sm p-2 rounded-lg">
                  <Home className="w-6 h-6" />
                  <span className="text-xl font-bold">{gameState.ownedHouseIds.length} Owned</span>
              </div>
              <button 
                onClick={() => setShowCart(!showCart)}
                className="bg-orange-500 hover:bg-orange-400 text-white p-2 rounded-lg shadow-lg pointer-events-auto flex items-center gap-2"
              >
                  <ShoppingCart className="w-6 h-6" />
                  <span className="font-bold">{gameState.vehicleInventory.length}</span>
              </button>
          </div>
      </div>

      {/* JOB BOARD - Right Side */}
      {gameState.phase === 'PLAYING' && (
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-40 pointer-events-auto flex flex-col gap-4">
              <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-2xl w-48">
                  <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Job Board</h3>
                  {/* ST Job */}
                  <button 
                    onClick={() => handleSelectJob('ST')}
                    className={`w-full py-3 rounded-lg font-bold border-2 transition-all flex flex-col items-center mb-2 ${
                        gameState.currentJob === 'ST' 
                        ? 'bg-red-600 border-red-400 text-white' 
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                      <span className="text-2xl">ST</span>
                      <span className="text-xs font-normal">Secret Task</span>
                  </button>
                  {/* MS Job */}
                   <button 
                    onClick={() => handleSelectJob('MS')}
                    className={`w-full py-3 rounded-lg font-bold border-2 transition-all flex flex-col items-center ${
                        gameState.currentJob === 'MS' 
                        ? 'bg-purple-600 border-purple-400 text-white' 
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                      <span className="text-2xl">MS</span>
                      <span className="text-xs font-normal">Mission Squad</span>
                  </button>
              </div>

              {/* ST Captured Counter */}
              {gameState.currentJob === 'ST' && gameState.vehicle?.isMissionVehicle && (
                  <div className="bg-red-900/90 border border-red-500 p-4 rounded-xl shadow-2xl text-center animate-pulse">
                      <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <h3 className="text-red-200 text-xs font-bold uppercase">Ghost Captured</h3>
                      <div className="text-4xl font-mono text-white">{gameState.capturedCount}</div>
                      <div className="text-xs text-red-300 mt-1">Reward: 80u / catch</div>
                  </div>
              )}

              {/* MS Prisoner Counter */}
              {gameState.currentJob === 'MS' && gameState.vehicle?.isMissionVehicle && (
                  <div className="bg-purple-900/90 border border-purple-500 p-4 rounded-xl shadow-2xl text-center animate-pulse">
                      <ShieldAlert className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h3 className="text-purple-200 text-xs font-bold uppercase">Prisoner No.</h3>
                      <div className="text-4xl font-mono text-white">#{1000 + gameState.prisonerCount}</div>
                      <div className="text-xs text-purple-300 mt-1">Reward: 200u / catch</div>
                  </div>
              )}
          </div>
      )}

      {/* FRIEND LIST DROPDOWN */}
      {showFriends && (
          <div className="absolute top-20 right-48 w-72 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-slate-800 animate-in fade-in slide-in-from-top-4 pointer-events-auto">
              <div className="bg-pink-500 p-3 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2 font-bold"><Users className="w-5 h-5" /> Friend List</div>
                  <button onClick={() => setShowFriends(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                  {gameState.friends.length === 0 ? (
                      <div className="text-center p-4 text-gray-400 italic">No friends added yet.</div>
                  ) : (
                      gameState.friends.map((friend) => (
                          <div 
                            key={friend.id} 
                            onClick={() => setViewingFriend(friend)}
                            className="bg-slate-100 p-3 rounded-lg flex items-center gap-3 border border-slate-200 hover:bg-slate-200 cursor-pointer transition-colors"
                          >
                              <div className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-xl overflow-hidden ${friend.type === 'HUMAN' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                                  {friend.type === 'HUMAN' ? '👤' : '🐶'}
                              </div>
                              <div className="flex-grow">
                                  <div className="font-bold text-sm">{friend.name}</div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {/* FRIEND PROFILE MODAL */}
      {viewingFriend && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
              <div className="bg-white rounded-2xl w-96 overflow-hidden shadow-2xl flex flex-col">
                  <div className="h-64 bg-slate-200 relative">
                        <Canvas shadows camera={{ position: [0, 1, 3], fov: 40 }}>
                            <Sky sunPosition={[10, 50, 10]} />
                            <ambientLight intensity={0.8} />
                            <directionalLight position={[2, 2, 5]} />
                            <ContactShadows resolution={512} scale={10} blur={1} opacity={0.5} />
                            <group position={[0, -0.8, 0]} scale={[1.8, 1.8, 1.8]}>
                                {viewingFriend.type === 'HUMAN' && viewingFriend.appearance && <PlayerAvatar appearance={viewingFriend.appearance} />}
                                {viewingFriend.type === 'DOG' && viewingFriend.breed && <PetAvatar type="DOG" breed={viewingFriend.breed} accessories={{hasClothing:false, hasShoes:false}} />}
                            </group>
                            <OrbitControls enableZoom={false} autoRotate />
                        </Canvas>
                        <button onClick={() => setViewingFriend(null)} className="absolute top-4 right-4 bg-white/80 p-1 rounded-full text-slate-600 hover:bg-white"><X size={20} /></button>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                       <div className="text-center">
                           <h2 className="text-2xl font-bold text-slate-800">{viewingFriend.name}</h2>
                       </div>
                       <div className="flex flex-col gap-3">
                           <button 
                                onClick={() => handleSummonFriend(viewingFriend)}
                                className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                           >
                               <Phone size={20} /> Bring {viewingFriend.name} Over
                           </button>
                           {gameState.followingFriendId === viewingFriend.id && (
                               <button 
                                    onClick={() => {
                                        setGameState(prev => ({...prev, followingFriendId: null, message: `${viewingFriend.name} stopped following.`}));
                                        setViewingFriend(null);
                                    }}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-bold"
                                >
                                   Stop Hanging Out
                               </button>
                           )}
                       </div>
                  </div>
              </div>
          </div>
      )}

      {/* SHOPPING CART */}
      {showCart && (
          <div className="absolute top-20 right-4 w-72 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-slate-800 animate-in fade-in slide-in-from-top-4 pointer-events-auto">
              <div className="bg-orange-500 p-3 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2 font-bold"><ShoppingCart className="w-5 h-5" /> Vehicle Cart</div>
                  <button onClick={() => setShowCart(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                  {gameState.vehicleInventory.length === 0 ? (
                      <div className="text-center p-4 text-gray-400 italic">No vehicles owned.</div>
                  ) : (
                      gameState.vehicleInventory.map((veh) => {
                          const isDrivingThis = gameState.vehicle?.id === veh.id;
                          return (
                              <div key={veh.id} className="bg-slate-100 p-3 rounded-lg flex items-center gap-3 border border-slate-200">
                                  <div className="w-10 h-10 rounded-md shadow-sm" style={{ backgroundColor: veh.color }} />
                                  <div className="flex-grow">
                                      <div className="font-bold text-sm">{veh.style}</div>
                                      <div className="text-xs text-slate-500 uppercase">{veh.isMissionVehicle ? 'Mission' : veh.color}</div>
                                  </div>
                                  <button 
                                      onClick={() => toggleDriving(veh)}
                                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${isDrivingThis ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                  >
                                      {isDrivingThis ? 'Put Away' : 'Drive'}
                                  </button>
                              </div>
                          );
                      })
                  )}
              </div>
          </div>
      )}

      {/* Minimap */}
      {gameState.phase === 'PLAYING' && cityData && (
          <Minimap 
            playerPosition={gameState.playerPosition} 
            sanctuaryPosition={cityData.sanctuaryPosition}
            cemeteryPosition={cityData.cemeteryPosition}
            rentalPosition={cityData.rentalPosition}
            carWashPosition={cityData.carWashPosition}
            carFactoryPosition={cityData.carFactoryPosition}
            stStationPosition={cityData.stStationPosition}
            msStationPosition={cityData.msStationPosition}
            royalCarriagePosition={cityData.royalCarriagePosition}
            currentJob={gameState.currentJob}
            allBuildings={cityData.buildings}
            ownedHouses={cityData.buildings.filter((b: Building) => gameState.ownedHouseIds.includes(b.id))}
            stores={cityData.buildings.filter((b: Building) => b.type === 'STORE')}
            recruitedStoreIds={gameState.recruitedBuildingIds}
          />
      )}

      {/* JAIL SCREEN */}
      {gameState.phase === 'JAIL_VIEW' && (
          <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white p-8 animate-in zoom-in duration-500">
               <ShieldAlert className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
               <h1 className="text-6xl font-bold text-red-500 mb-2">ARRESTED!</h1>
               <p className="text-2xl text-gray-300 mb-8 max-w-lg text-center">
                   You were caught driving illegally with the Royal System active. The King's Guards have taken you into custody.
               </p>
               <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold text-xl transition-all hover:scale-105">
                   Restart Game
               </button>
          </div>
      )}

      {/* OVERLAYS */}
      {isWorking && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
               <Briefcase className="w-20 h-20 animate-bounce mb-4 text-yellow-400" />
               <h2 className="text-4xl font-bold">WORKING...</h2>
               <p className="text-xl mt-2">Shift ends at 2:00 PM</p>
          </div>
      )}
      
      {isWashing && (
          <div className="absolute inset-0 z-50 bg-cyan-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
               <Droplets className="w-20 h-20 animate-bounce mb-4 text-cyan-400" />
               <h2 className="text-4xl font-bold">Car Wash in Progress...</h2>
          </div>
      )}
      
      {gameState.dayCount >= CHECKOUT_DAY && (
          <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white p-8">
               <h1 className="text-6xl font-bold text-red-500 mb-6">CHECKOUT DATE REACHED</h1>
               <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-4 rounded-full font-bold text-xl hover:bg-gray-200">Restart Game</button>
          </div>
      )}

      {adoptionType && <PetAdoptionModal type={adoptionType} onClose={() => setAdoptionType(null)} onAdopt={confirmAdoption} price={PET_PRICES[adoptionType]} />}
      {showCarRental && <CarRentalModal onClose={() => setShowCarRental(false)} onRent={handleRentCar} />}
      {showCarFactory && <CarFactoryModal onClose={() => setShowCarFactory(false)} onBuild={handleBuildCar} partsAvailable={gameState.parts} />}
      
      {selectedPetId && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto">
               <div className="bg-white text-black p-6 rounded-2xl shadow-2xl w-80 flex flex-col gap-4 animate-in fade-in zoom-in">
                   <h3 className="text-xl font-bold text-center">Interact with Pet</h3>
                   <div className="flex flex-col gap-2">
                       <button onClick={() => performPetAction('PET')} className="bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                           <Hand className="w-5 h-5" /> Pet it
                       </button>
                       <button onClick={() => setSelectedPetId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-xl font-bold">Close</button>
                   </div>
               </div>
          </div>
      )}

      {/* CITY INTERACTIONS */}
      {gameState.phase === 'PLAYING' && (
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 z-40 pointer-events-auto">
          {gameState.message && <div className="bg-black/80 px-6 py-3 rounded-lg text-lg animate-pulse text-center max-w-lg mb-2">{gameState.message}</div>}

          {/* ST STATION BUTTON */}
          {nearbyBuilding && nearbyBuilding.type === 'ST_STATION' && gameState.currentJob === 'ST' && !isWorking && (
               <button 
                onClick={handleEnterSTStation}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3 animate-bounce"
               >
                   <Target className="w-6 h-6" /> Enter Station
               </button>
          )}

          {/* MS STATION BUTTON */}
          {nearbyBuilding && nearbyBuilding.type === 'MS_STATION' && gameState.currentJob === 'MS' && !isWorking && (
               <button 
                onClick={handleEnterMSStation}
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3 animate-bounce"
               >
                   <ShieldAlert className="w-6 h-6" /> Enter MS Station
               </button>
          )}

          {/* ROYAL CARRIAGE BUTTON */}
          {nearbyBuilding && nearbyBuilding.type === 'ROYAL_CARRIAGE' && !isWorking && (
              <button 
               onClick={handleEnterRoyalCarriage}
               className="bg-pink-500 hover:bg-pink-400 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3 animate-bounce border-2 border-gold"
              >
                  <Crown className="w-6 h-6 text-yellow-300" /> Enter Royal Carriage
              </button>
         )}

          {/* ... existing interaction buttons ... */}
          {nearbyBuilding && nearbyBuilding.type === 'PET_SANCTUARY' && !isWorking && (
              <div className="bg-slate-800 p-4 rounded-xl border border-blue-500 shadow-xl flex gap-4">
                   <div className="text-center font-bold mb-2 w-full col-span-3">PET SANCTUARY</div>
                   <button onClick={() => initiateAdoption('CAT')} className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg flex flex-col items-center min-w-[80px]"><span>Cat</span><span className="text-yellow-400 text-sm">20c</span></button>
                   <button onClick={() => initiateAdoption('DOG')} className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg flex flex-col items-center min-w-[80px]"><span>Dog</span><span className="text-yellow-400 text-sm">30c</span></button>
                   <button onClick={() => initiateAdoption('BIRD')} className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg flex flex-col items-center min-w-[80px]"><span>Bird</span><span className="text-yellow-400 text-sm">10c</span></button>
              </div>
          )}
          {nearbyBuilding && nearbyBuilding.type === 'CAR_RENTAL' && !isWorking && (
               <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-blue-500 text-blue-200">Click the blue button to rent a car!</div>
          )}
          {nearbyBuilding && nearbyBuilding.type === 'CAR_WASH' && !isWorking && (
               <button onClick={handleCarWash} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3 animate-bounce"><Droplets className="w-6 h-6" /> Wash Car (10 Units)</button>
          )}
          {nearbyBuilding && nearbyBuilding.type === 'CAR_FACTORY' && !isWorking && (
               <button onClick={() => setShowCarFactory(true)} className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3 animate-bounce"><Factory className="w-6 h-6" /> Enter Car Factory (Pink Option)</button>
          )}
          {nearbyBuilding && nearbyBuilding.type.includes('HOUSE') && nearbyBuilding.isOccupied && !nearbyBuilding.isOwned && nearbyBuilding.occupiedById && (
              (() => {
                  const friend = gameState.friends.find(f => f.id === nearbyBuilding.occupiedById);
                  if (friend) {
                      return <button onClick={() => handleVisitFriendHouse(friend)} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3"><Home className="w-6 h-6" /> Tour {friend.name}'s House</button>;
                  }
                  return null;
              })()
          )}
          {(nearbyBuilding && (nearbyBuilding.type.includes('HOUSE') || nearbyBuilding.type === 'STORE') && !gameState.ownedHouseIds.includes(nearbyBuilding.id) && !isWorking) && (
              <button onClick={handleInteraction} className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3 animate-bounce">{nearbyBuilding.type === 'STORE' ? <Store className="w-6 h-6" /> : <Home className="w-6 h-6" />} Buy {nearbyBuilding.type === 'STORE' ? 'Company' : 'House'} ({nearbyBuilding.price} Units)</button>
          )}
          {nearbyBuilding && nearbyBuilding.type.includes('HOUSE') && gameState.ownedHouseIds.includes(nearbyBuilding.id) && !isWorking && (
              <button onClick={handleReturnHome} className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3"><Home className="w-6 h-6" /> Enter Home</button>
          )}
          {nearbyBuilding && nearbyBuilding.type === 'HOTEL' && !isWorking && (
              <button onClick={handleInteraction} className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3"><MapPin className="w-6 h-6" /> Read Sign</button>
          )}
          {nearbyBuilding && nearbyBuilding.type === 'STORE' && !isWorking && (
              <div className="flex gap-4">
                  {gameState.ownedHouseIds.includes(nearbyBuilding.id) ? (
                      gameState.timeOfDay < 840 ? (
                        <button onClick={startWork} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3"><Briefcase className="w-6 h-6" /> Work (Get 200 Parts)</button>
                      ) : (
                        <div className="bg-slate-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-600">Work shift over (Wait for 7 AM)</div>
                      )
                  ) : (<div className="bg-slate-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-600">Buy this store to work here.</div>)}
                  {!gameState.recruitedBuildingIds.includes(nearbyBuilding.id) && <button onClick={() => handleRecruit(nearbyBuilding.id)} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3"><UserPlus className="w-6 h-6" /> Recruit (Click Green Button)</button>}
              </div>
          )}
      </div>
      )}
    </div>
  );
}

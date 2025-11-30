

export type RegionType = 'RIVERSIDE' | 'DESERT' | 'SWAMP';

export type Position = [number, number, number];

export type PetType = 'CAT' | 'DOG' | 'BIRD';
export type EntityType = PetType | 'HUMAN';

// Breeds
export type CatBreed = 'WHITE' | 'BLACK' | 'SIAMESE' | 'CALICO' | 'ORANGE' | 'GRAY' | 'TUXEDO' | 'PERSIAN';
export type DogBreed = 'GOLDEN' | 'PUG' | 'HUSKY' | 'DALMATIAN' | 'BEAGLE' | 'POODLE' | 'SHEPHERD' | 'BULLDOG';
export type BirdBreed = 'BLUE_JAY' | 'CARDINAL' | 'CANARY' | 'PARROT';

export interface PetAccessories {
  collarColor?: string;
  clothingColor?: string;
  hasClothing: boolean;
  shoeColor?: string;
  hasShoes: boolean; // Cats and Dogs only
}

export type Mood = 
  | 'LACK_CONFIDENCE' 
  | 'EMBARRASSED' 
  | 'DISCOMFORT' 
  | 'BORED' 
  | 'TRIGGERED' 
  | 'EXCITED' 
  | 'FOCUSED' 
  | 'SLEEPY';

export type HairStyle = 'PONYTAIL' | 'BOB' | 'LONG' | 'BUNS';
export type ClothingTop = 'TSHIRT' | 'JACKET';
export type ClothingBottom = 'SKIRT' | 'SHORTS' | 'PANTS_LONG' | 'PANTS_SHORT';
export type EyebrowStyle = 'ARCHED' | 'FLAT' | 'ROUND';

export interface CharacterAppearance {
  // Head
  hairStyle: HairStyle;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  eyebrowStyle: EyebrowStyle;
  lipColor: string;

  // Body / Clothes
  topType: ClothingTop;
  topColor: string;
  bottomType: ClothingBottom;
  bottomColor: string;
  
  // Feet
  sockColor: string;
  shoeColor: string;
  
  // Accessories
  hasNecklace: boolean;
  hasEarrings: boolean;
  hasBracelets: boolean;
  hasRing: boolean;
}

export interface Pet {
  id: string;
  type: PetType;
  name: string;
  breed: string; // Stored as string to handle union types
  accessories: PetAccessories;
  isHeld?: boolean; 
}

export interface NPC {
  id: string;
  type: EntityType;
  position: Position;
  rotation: number;
  color: string;
  isFriend?: boolean;
  name: string;
  breed?: string;
  appearance?: CharacterAppearance; // For humans
  carryingItem?: 'BOX' | 'BAG' | null;
  homeBuildingId?: string; // Links NPC to a specific house
  isShort?: boolean; // Target for ST job
  isPrisoner?: boolean; // Target for MS job (Black clothes)
}

export interface Building {
  id: string;
  type: 'HOUSE_L1' | 'HOUSE_L2' | 'HOUSE_L3' | 'HOTEL' | 'PET_SANCTUARY' | 'ROAD' | 'STORE' | 'PET_CEMETERY' | 'CAR_RENTAL' | 'CAR_WASH' | 'CAR_FACTORY' | 'ST_STATION' | 'MS_STATION' | 'ROYAL_CARRIAGE';
  position: Position;
  rotation: number;
  price?: number; // For houses and stores
  isOwned?: boolean; // For houses and stores
  isRecruited?: boolean; // For stores
  isOccupied?: boolean; // For NPC houses
  occupiedById?: string; // ID of the NPC living here
}

export type CarStyle = 'SEDAN' | 'SUV' | 'SPORTS' | 'GOLDEN_CARRIAGE';

export interface Vehicle {
  id: string;
  style: CarStyle;
  color: string;
  isMissionVehicle?: boolean; // Bought from ST/MS Station
}

export interface GameState {
  phase: 'REGION_SELECT' | 'CHARACTER_SELECT' | 'PLAYING' | 'HOME_VIEW' | 'FRIEND_HOUSE_VIEW' | 'ST_STATION_VIEW' | 'MS_STATION_VIEW' | 'ROYAL_CHAMBER_VIEW' | 'JAIL_VIEW';
  region: RegionType;
  money: number;
  parts: number; 
  timeOfDay: number; 
  message: string | null;
  dayCount: number;
  pets: Pet[];
  friends: NPC[]; // Added Friend List
  npcs: NPC[]; // Active World NPCs
  followingFriendId: string | null; // ID of friend currently following player
  visitingFriendId: string | null; // ID of friend whose house we are visiting
  ownedHouseIds: string[];
  recruitedBuildingIds: string[]; 
  furniture: string[]; // IDs of furniture owned in the home
  playerPosition: Position;
  rentPaidToday: boolean;
  storyMode: boolean; 
  mood: Mood;
  appearance: CharacterAppearance;
  vehicle: Vehicle | null; 
  vehicleInventory: Vehicle[];
  currentJob: 'ST' | 'MS' | null;
  capturedCount: number; // For ST Job
  prisonerCount: number; // For MS Job
  hasRoyalSystem: boolean; // Acquired from Royal Chamber
}

export const HOUSE_PRICES = {
  HOUSE_L1: 50,
  HOUSE_L2: 100,
  HOUSE_L3: 200,
};

export const STORE_PRICE = 300;

export const PET_PRICES = {
  CAT: 20,
  DOG: 30,
  BIRD: 10,
};

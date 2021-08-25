/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AbilityEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  abilityId: number;
  displayNames: LocalString[];
  flavourTextEntries: LocalStringListWithId[];
}

export interface BaseStatInfo {
  /** @format int32 */
  statId: number;

  /** @format int32 */
  baseValue: number;
}

export interface ChainLink {
  isBaby: boolean;
  species?: PokemonSpeciesNamedApiResource;
  evolutionDetails: EvolutionDetail[];
  evolvesTo: ChainLink[];
}

export interface ChainLinkEntry {
  isBaby: boolean;
  species: PokemonSpeciesEntry;
  evolutionDetails: EvolutionDetailEntry[];
  evolvesTo: ChainLinkEntry[];
}

export interface ConditionValuesDetail {
  conditionValues: EncounterConditionValueEntry[];
  encounterDetails: EncounterDetailEntry[];
}

export interface DoubleWithId {
  /** @format int32 */
  id: number;

  /** @format double */
  data: number;
}

export interface EfficacyEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  typeId: number;
  efficacySets: EfficacySetWithId[];
}

export interface EfficacySet {
  efficacyMultipliers: DoubleWithId[];
}

export interface EfficacySetWithId {
  /** @format int32 */
  id: number;
  data: EfficacySet;
}

export interface EncounterConditionValueEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  encounterConditionValueId: number;
  displayNames: LocalString[];
}

export interface EncounterDetailEntry {
  /** @format int32 */
  minLevel: number;

  /** @format int32 */
  maxLevel: number;

  /** @format int32 */
  chance: number;
}

export interface EncounterEntry {
  /** @format int32 */
  locationAreaId: number;
  displayNames: LocalString[];
  details: EncounterMethodDetailsListWithId[];
}

export interface EncounterEntryListWithId {
  /** @format int32 */
  id: number;
  data: EncounterEntry[];
}

export interface EncounterMethodDetails {
  method: EncounterMethodEntry;
  conditionValuesDetails: ConditionValuesDetail[];
}

export interface EncounterMethodDetailsListWithId {
  /** @format int32 */
  id: number;
  data: EncounterMethodDetails[];
}

export interface EncounterMethodEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  encounterMethodId: number;

  /** @format int32 */
  order: number;
  displayNames: LocalString[];
}

export interface EncountersEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  pokemonId: number;
  encounters: EncounterEntryListWithId[];
}

export interface EvolutionChain {
  /** @format int32 */
  id: number;
  babyTriggerItem?: ItemNamedApiResource;
  chain?: ChainLink;
}

export interface EvolutionChainEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  evolutionChainId: number;
  chain: ChainLinkEntry;
}

export interface EvolutionDetail {
  item?: ItemNamedApiResource;
  trigger?: EvolutionTriggerNamedApiResource;

  /** @format int32 */
  gender?: number;
  heldItem?: ItemNamedApiResource;
  knownMove?: MoveNamedApiResource;
  knownMoveType?: TypeNamedApiResource;
  location?: LocationNamedApiResource;

  /** @format int32 */
  minLevel?: number;

  /** @format int32 */
  minHappiness?: number;

  /** @format int32 */
  minBeauty?: number;

  /** @format int32 */
  minAffection?: number;
  needsOverworldRain: boolean;
  partySpecies?: PokemonSpeciesNamedApiResource;
  partyType?: TypeNamedApiResource;

  /** @format int32 */
  relativePhysicalStats?: number;
  timeOfDay?: string;
  tradeSpecies?: PokemonSpeciesNamedApiResource;
  turnUpsideDown: boolean;
}

export interface EvolutionDetailEntry {
  item?: ItemEntry;
  trigger?: EvolutionTriggerEntry;

  /** @format int32 */
  gender?: number;
  heldItem?: ItemEntry;
  knownMove?: MoveEntry;
  knownMoveType?: TypeEntry;
  location?: LocationEntry;

  /** @format int32 */
  minLevel?: number;

  /** @format int32 */
  minHappiness?: number;

  /** @format int32 */
  minBeauty?: number;

  /** @format int32 */
  minAffection?: number;
  needsOverworldRain: boolean;
  partySpecies?: PokemonSpeciesEntry;
  partyType?: TypeEntry;

  /** @format int32 */
  relativePhysicalStats?: number;
  timeOfDay?: string;
  tradeSpecies?: PokemonSpeciesEntry;
  turnUpsideDown: boolean;
}

export interface EvolutionTriggerEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  evolutionTriggerId: number;
  displayNames: LocalString[];
}

export interface EvolutionTriggerNamedApiResource {
  url?: string;
  name?: string;
}

export interface GenerationEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  generationId: number;
  displayNames: LocalString[];
}

export interface GenerationInfo {
  /** @format int32 */
  generationId: number;
  name?: string;
  generationNamesInfo: GenerationNamesInfo[];
}

export interface GenerationNamesInfo {
  name?: string;
}

export interface Int32ListWithId {
  /** @format int32 */
  id: number;
  data: number[];
}

export interface ItemEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  itemId: number;
  displayNames: LocalString[];
}

export interface ItemNamedApiResource {
  url?: string;
  name?: string;
}

export interface LocalString {
  language: string;
  value: string;
}

export interface LocalStringListWithId {
  /** @format int32 */
  id: number;
  data: LocalString[];
}

export interface LocationEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  locationId: number;
  displayNames: LocalString[];
}

export interface LocationNamedApiResource {
  url?: string;
  name?: string;
}

export interface MachineEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  machineId: number;
  item: ItemEntry;
}

export interface MachineEntryListWithId {
  /** @format int32 */
  id: number;
  data: MachineEntry[];
}

export interface MoveCategoryEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  moveCategoryId: number;
  descriptions: LocalString[];
}

export interface MoveDamageClassEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  moveDamageClassId: number;
  displayNames: LocalString[];
}

export interface MoveEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  moveId: number;
  displayNames: LocalString[];
  flavourTextEntries: LocalStringListWithId[];
  type: TypeEntry;
  category: MoveCategoryEntry;

  /** @format int32 */
  power?: number;
  damageClass: MoveDamageClassEntry;

  /** @format int32 */
  accuracy?: number;

  /** @format int32 */
  pp?: number;

  /** @format int32 */
  priority: number;
  target: MoveTargetEntry;
  machines: MachineEntryListWithId[];
}

export interface MoveEntryListWithId {
  /** @format int32 */
  id: number;
  data: MoveEntry[];
}

export interface MoveLearnMethodEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  moveLearnMethodId: number;
  displayNames: LocalString[];
  descriptions: LocalString[];
}

export interface MoveNamedApiResource {
  url?: string;
  name?: string;
}

export interface MoveTargetEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  moveTargetId: number;
  displayNames: LocalString[];
}

export interface PokedexEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  pokedexId: number;
  displayNames: LocalString[];
}

export interface PokedexInfo {
  /** @format int32 */
  pokedexId: number;
}

export interface PokemonAbilityContext {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  abilityId: number;
  displayNames: LocalString[];
  flavourTextEntries: LocalStringListWithId[];
  isHidden: boolean;
}

export interface PokemonEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  pokemonId: number;
  spriteUrl: string;
  shinySpriteUrl: string;
  displayNames: LocalString[];
  forms: PokemonFormEntry[];
  types: TypeEntryListWithId[];
  abilities: AbilityEntry[];
  baseStats: Int32ListWithId[];
  moves: MoveEntryListWithId[];
  heldItems: VersionHeldItemContextListWithId[];
}

export interface PokemonFormEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  pokemonFormId: number;
  formName: string;
  isMega: boolean;
  versionGroup: VersionGroupEntry;
  displayNames: LocalString[];
  spriteUrl: string;
  shinySpriteUrl: string;
  types: TypeEntryListWithId[];
  validity: number[];
}

export interface PokemonFormEntryListWithId {
  /** @format int32 */
  id: number;
  data: PokemonFormEntry[];
}

export interface PokemonMoveContext {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  moveId: number;
  displayNames: LocalString[];
  flavourTextEntries: LocalStringListWithId[];
  type: TypeEntry;
  category: MoveCategoryEntry;

  /** @format int32 */
  power?: number;
  damageClass: MoveDamageClassEntry;

  /** @format int32 */
  accuracy?: number;

  /** @format int32 */
  pp?: number;

  /** @format int32 */
  priority: number;
  target: MoveTargetEntry;
  machines: MachineEntryListWithId[];

  /** @format int32 */
  level: number;
  learnMachines: ItemEntry[];
  methods: MoveLearnMethodEntry[];
}

export interface PokemonSpeciesEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  pokemonSpeciesId: number;
  spriteUrl: string;
  shinySpriteUrl: string;
  displayNames: LocalString[];
  genera: LocalString[];
  flavourTextEntries: LocalStringListWithId[];
  types: TypeEntryListWithId[];
  baseStats: Int32ListWithId[];
  varieties: PokemonEntry[];
  generation: GenerationEntry;
  evolutionChain: EvolutionChain;
  validity: number[];

  /** @format int32 */
  catchRate: number;
}

export interface PokemonSpeciesInfo {
  /** @format int32 */
  pokemonSpeciesId: number;
  name?: string;

  /** @format int32 */
  order: number;

  /** @format int32 */
  generationId: number;
  names: PokemonSpeciesNamesInfo[];
  pokedexes: PokedexInfo[];
  varieties: VarietyInfo[];
  validity: number[];
}

export interface PokemonSpeciesNamedApiResource {
  url?: string;
  name?: string;
}

export interface PokemonSpeciesNamesInfo {
  name?: string;
}

export interface StatEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  statId: number;
  displayNames: LocalString[];
  isBattleOnly: boolean;
}

export interface TypeEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  typeId: number;
  displayNames: LocalString[];
  isConcrete: boolean;
  generation: GenerationEntry;
}

export interface TypeEntryListWithId {
  /** @format int32 */
  id: number;
  data: TypeEntry[];
}

export interface TypeInfo {
  /** @format int32 */
  typeId: number;
  name?: string;

  /** @format int32 */
  generationId: number;
  typeNamesInfo: TypeNamesInfo[];
}

export interface TypeNamedApiResource {
  url?: string;
  name?: string;
}

export interface TypeNamesInfo {
  name?: string;
}

export interface VarietyInfo {
  isDefault: boolean;
  types: VarietyTypeInfo[];
  baseStats: BaseStatInfo[];
}

export interface VarietyTypeInfo {
  /** @format int32 */
  typeId: number;
}

export interface VersionEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  versionId: number;
  displayNames: LocalString[];
}

export interface VersionGroupEntry {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  versionGroupId: number;

  /** @format int32 */
  order: number;
  displayNames: LocalString[];
  generation: GenerationEntry;
  versions: VersionEntry[];
  pokedexes: PokedexEntry[];
}

export interface VersionGroupInfo {
  /** @format int32 */
  versionGroupId: number;

  /** @format int32 */
  generationId: number;
  versionInfo: VersionInfo[];
  pokedexes: PokedexInfo[];
}

export interface VersionHeldItemContext {
  id: string;
  name: string;

  /** @format date-time */
  creationTime: string;

  /** @format int32 */
  itemId: number;
  displayNames: LocalString[];

  /** @format int32 */
  rarity: number;
}

export interface VersionHeldItemContextListWithId {
  /** @format int32 */
  id: number;
  data: VersionHeldItemContext[];
}

export interface VersionInfo {
  /** @format int32 */
  versionId: number;
  versionNamesInfo: VersionNamesInfo[];
}

export interface VersionNamesInfo {
  name?: string;
}

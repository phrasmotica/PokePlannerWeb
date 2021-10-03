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

export interface AbilityInfo {
  /** @format int32 */
  id: number;
  name?: string;

  /** @format int32 */
  generationId: number;
  names: AbilityNamesInfo[];
  flavorTexts: FlavorTextInfo[];
}

export interface AbilityNamesInfo {
  name?: string;
}

export interface AggregateContainer {
  aggregate?: AggregateValues;
}

export interface AggregateValues {
  /** @format int32 */
  count: number;
}

export interface BaseStatInfo {
  /** @format int32 */
  statId: number;

  /** @format int32 */
  baseValue: number;
}

export interface Category {
  /** @format int32 */
  id: number;
  name?: string;
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

export interface Condition {
  encounterConditionValue?: EncounterConditionValue;
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

export interface EncounterConditionValue {
  /** @format int32 */
  id: number;
  name?: string;
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

export interface EncountersInfo {
  /** @format int32 */
  locationAreaId: number;

  /** @format int32 */
  pokemonId: number;

  /** @format int32 */
  minLevel: number;

  /** @format int32 */
  maxLevel: number;

  /** @format int32 */
  versionId: number;
  conditions: Condition[];
  encounterSlot?: EncounterSlot;
}

export interface EncounterSlot {
  method?: LearnMethod;

  /** @format int32 */
  rarity: number;

  /** @format int32 */
  slot: number;
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

export interface FlavorTextInfo {
  flavorText?: string;
}

export interface FormInfo {
  /** @format int32 */
  id: number;
  formName?: string;
  isMega: boolean;
  names: FormNamesInfo[];
  types: FormTypeInfo[];
}

export interface FormNamesInfo {
  name?: string;
}

export interface FormTypeInfo {
  /** @format int32 */
  typeId: number;
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

export interface LearnMethod {
  /** @format int32 */
  id: number;
  name?: string;
  names: LearnMethodName[];
}

export interface LearnMethodInfo {
  name?: string;
  names: LearnMethodNames[];
}

export interface LearnMethodName {
  name?: string;
}

export interface LearnMethodNames {
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

export interface LocationAreaInfo {
  /** @format int32 */
  id: number;
  name?: string;
  names: LocationAreaName[];
}

export interface LocationAreaName {
  name?: string;
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

export interface LocationInfo {
  /** @format int32 */
  id: number;
  name?: string;
  names: LocationName[];
  locationAreas: LocationAreaInfo[];
}

export interface LocationName {
  name?: string;
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

export interface MoveDamageClassInfo {
  /** @format int32 */
  id: number;
  name?: string;
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

export interface MoveInfo {
  /** @format int32 */
  id: number;
  name?: string;

  /** @format int32 */
  power?: number;

  /** @format int32 */
  accuracy?: number;

  /** @format int32 */
  pp?: number;

  /** @format int32 */
  priority: number;
  damageClass?: MoveDamageClassInfo;
  flavorTexts: FlavorTextInfo[];
  meta: MoveMetaInfo[];
  names: MoveNames[];
  target?: MoveTargetInfo;
  type?: MoveTypeInfo;
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

export interface MoveMetaInfo {
  category?: Category;
}

export interface MoveNamedApiResource {
  url?: string;
  name?: string;
}

export interface MoveNames {
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

export interface MoveTargetInfo {
  /** @format int32 */
  id: number;
  name?: string;
}

export interface MoveTypeInfo {
  /** @format int32 */
  id: number;
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
  names: PokedexNamesInfo[];
}

export interface PokedexNamesInfo {
  name?: string;
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

export interface PokemonFormSprites {
  frontDefault?: string;
  frontShiny?: string;
  backDefault?: string;
  backShiny?: string;
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

export interface PokemonMoveInfo {
  /** @format int32 */
  id: number;

  /** @format int32 */
  level: number;
  learnMethod?: LearnMethodInfo;
  move?: MoveInfo;
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

  /** @format int32 */
  captureRate: number;
  names: PokemonSpeciesNamesInfo[];
  pokedexes: PokemonSpeciesPokedexInfo[];
  flavorTexts: FlavorTextInfo[];
  varieties: VarietyInfo[];
}

export interface PokemonSpeciesNamedApiResource {
  url?: string;
  name?: string;
}

export interface PokemonSpeciesNamesInfo {
  name?: string;
  genus?: string;
}

export interface PokemonSpeciesPokedexInfo {
  /** @format int32 */
  pokedexId: number;

  /** @format int32 */
  pokedexNumber: number;
}

export interface PokemonSprites {
  frontDefault?: string;
  frontShiny?: string;
  frontFemale?: string;
  frontShinyFemale?: string;
  backDefault?: string;
  backShiny?: string;
  backFemale?: string;
  backShinyFemale?: string;
}

export interface RegionInfo {
  /** @format int32 */
  id: number;
  name?: string;
  names: RegionNamesInfo[];
}

export interface RegionNamesInfo {
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

export interface StatInfo {
  /** @format int32 */
  statId: number;
  name?: string;
  isBattleOnly: boolean;
  statNamesInfo: StatNamesInfo[];
}

export interface StatNamesInfo {
  name?: string;
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
  pokemonTypesAggregate?: AggregateContainer;
}

export interface TypeNamedApiResource {
  url?: string;
  name?: string;
}

export interface TypeNamesInfo {
  name?: string;
}

export interface VarietyAbilityInfo {
  /** @format int32 */
  slot: number;
  isHidden: boolean;
  ability?: AbilityInfo;
}

export interface VarietyInfo {
  /** @format int32 */
  id: number;
  name?: string;
  isDefault: boolean;
  abilities: VarietyAbilityInfo[];
  forms: FormInfo[];
  pastTypes: VarietyPastTypeInfo[];
  stats: BaseStatInfo[];
  types: VarietyTypeInfo[];
}

export interface VarietyPastTypeInfo {
  /** @format int32 */
  generationId: number;

  /** @format int32 */
  typeId: number;
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
  versionGroupPokedexes: VersionGroupPokedexInfo[];
  versionGroupRegions: VersionGroupRegionInfo[];
}

export interface VersionGroupPokedexInfo {
  pokedex?: PokedexInfo;
}

export interface VersionGroupRegionInfo {
  region?: RegionInfo;
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

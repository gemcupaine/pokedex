export type PokemonDetails = {
  id: number;
  name: string;
  base_experience: number | null;
  height: number; // decimetres
  weight: number; // hectograms
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  sprites: {
    front_default: string | null;
    other?: { "official-artwork"?: { front_default: string | null } };
  };
};

export type PokemonListItem = {
  id: number;
  name: string;
};

export type PokemonListPage = {
  count: number;
  next: string | null;
  results: PokemonListItem[];
};

type NamedResource = { name: string; url: string };

export type PokemonSpecies = {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  /** Chance of being female in eighths; -1 means genderless. */
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  hatch_counter: number | null;
  growth_rate: NamedResource;
  egg_groups: NamedResource[];
  genera: { genus: string; language: NamedResource }[];
  flavor_text_entries: { flavor_text: string; language: NamedResource }[];
  evolution_chain: { url: string } | null;
};

export type EvolutionChainLink = {
  species: NamedResource;
  evolves_to: EvolutionChainLink[];
};

/** Species-level extras for the details screen. */
export type PokemonSpeciesInfo = {
  genus: string | null;
  description: string | null;
  isLegendary: boolean;
  isMythical: boolean;
  /** Evolution stages in order; each stage can branch (e.g. Eevee). */
  evolutions: PokemonListItem[][];
};

export type PokemonTypeDetails = {
  name: string;
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
};

/** Defensive multiplier groups, e.g. `{ multiplier: 2, types: ["water"] }`. */
export type TypeMatchupGroup = { multiplier: number; types: string[] };

/** Everything the stats sheet shows, derived from pokemon + species + type data. */
export type PokemonInsights = {
  pokemon: PokemonDetails;
  species: PokemonSpecies | null;
  weaknesses: TypeMatchupGroup[];
  resistances: TypeMatchupGroup[];
  immunities: string[];
};

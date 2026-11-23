const BASE_URL = "https://pokeapi.co/api/v2";

export type PokemonDetails = {
  id: number;
  name: string;
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

/** Fetch a Pokemon by national dex number or name. */
export async function getPokemon(
  idOrName: string | number,
  signal?: AbortSignal,
): Promise<PokemonDetails> {
  const res = await fetch(`${BASE_URL}/pokemon/${String(idOrName).toLowerCase()}`, { signal });
  if (!res.ok) {
    throw new Error(res.status === 404 ? "Pokemon not found" : `Request failed (${res.status})`);
  }
  return res.json();
}

export function getArtworkUrl(pokemon: PokemonDetails): string | null {
  return pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default;
}

export function formatName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

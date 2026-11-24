import { useCallback, useEffect, useRef, useState } from "react";

import type {
  EvolutionChainLink,
  PokemonDetails,
  PokemonListItem,
  PokemonListPage,
  PokemonSpecies,
  PokemonInsights,
  PokemonSpeciesInfo,
  PokemonTypeDetails,
} from "@/types/pokemon";

import { getDefensiveMatchups } from "./pokemon-insights";

const BASE_URL = "https://pokeapi.co/api/v2";
const TIMEOUT_MS = 15_000;
// PokeAPI data is effectively static, so successful responses are reused for the
// session (e.g. the stats sheet reuses what the details screen already loaded).
const CACHE_LIMIT = 300;
const responseCache = new Map<string, unknown>();

export type PokeApiErrorKind = "network" | "timeout" | "not-found" | "server" | "invalid";

/** A failed request, with a message that is safe to show in the UI. */
export class PokeApiError extends Error {
  readonly kind: PokeApiErrorKind;

  constructor(message: string, kind: PokeApiErrorKind) {
    super(message);
    this.name = "PokeApiError";
    this.kind = kind;
  }
}

/** User-facing message for anything thrown by this module. */
export function getErrorMessage(error: unknown): string {
  return error instanceof PokeApiError ? error.message : "Something went wrong. Please try again.";
}

/**
 * GET a PokeAPI path with a timeout and readable errors. A caller abort is
 * rethrown untouched so callers can tell cancellation apart from failure.
 */
async function fetchJson<T>(
  path: string,
  { signal, notFoundMessage = "Not found." }: { signal?: AbortSignal; notFoundMessage?: string } = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  if (responseCache.has(url)) return responseCache.get(url) as T;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      if (res.status === 404) throw new PokeApiError(notFoundMessage, "not-found");
      if (res.status >= 500 || res.status === 429) {
        throw new PokeApiError("PokeAPI is having trouble right now. Try again in a moment.", "server");
      }
      throw new PokeApiError(`Request failed (${res.status}).`, "server");
    }
    const data = (await res.json()) as T;
    if (responseCache.size >= CACHE_LIMIT) {
      responseCache.delete(responseCache.keys().next().value as string);
    }
    responseCache.set(url, data);
    return data;
  } catch (error) {
    if (error instanceof PokeApiError || signal?.aborted) throw error;
    if (timedOut) {
      throw new PokeApiError("The request timed out. Check your connection and try again.", "timeout");
    }
    if (error instanceof SyntaxError) {
      throw new PokeApiError("PokeAPI sent an unexpected response.", "invalid");
    }
    throw new PokeApiError("You appear to be offline. Check your connection and try again.", "network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** Fetch a Pokemon by national dex number or name. */
export function getPokemon(idOrName: string | number, signal?: AbortSignal): Promise<PokemonDetails> {
  const key = encodeURIComponent(String(idOrName).trim().toLowerCase());
  return fetchJson(`/pokemon/${key}`, { signal, notFoundMessage: "Pokemon not found." });
}

/**
 * Category, description and evolution line for a Pokemon. Alternate forms
 * (ids above 10000) have no species entry of their own, so this rejects with
 * a "not-found" error for them; callers should treat it as optional data.
 */
export async function getPokemonSpeciesInfo(
  idOrName: string | number,
  signal?: AbortSignal,
): Promise<PokemonSpeciesInfo> {
  const species = await getPokemonSpecies(idOrName, signal);

  let evolutions: PokemonListItem[][] = [];
  if (species.evolution_chain?.url) {
    try {
      const chain = await fetchJson<{ chain: EvolutionChainLink }>(species.evolution_chain.url, {
        signal,
      });
      evolutions = flattenEvolutionChain(chain.chain);
    } catch (error) {
      if (signal?.aborted) throw error;
      // The rest of the species info is still worth showing.
    }
  }

  const english = <T extends { language: { name: string } }>(entries: T[]) =>
    entries.filter((entry) => entry.language.name === "en");

  return {
    genus: english(species.genera)[0]?.genus ?? null,
    // The latest English entry; older games' text has hard line breaks and form feeds.
    description: english(species.flavor_text_entries).at(-1)?.flavor_text.replace(/\s+/g, " ").trim() ?? null,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    evolutions,
  };
}

/** Breadth-first walk so each array is one evolution stage. */
function flattenEvolutionChain(root: EvolutionChainLink): PokemonListItem[][] {
  const stages: PokemonListItem[][] = [];
  let level = [root];
  while (level.length > 0) {
    stages.push(level.map(({ species }) => ({ name: species.name, id: getIdFromUrl(species.url) })));
    level = level.flatMap((link) => link.evolves_to);
  }
  return stages;
}

export type RequestState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };

/**
 * Runs `load(id, signal)` whenever `id` changes, cancelling the previous
 * request. `load` should be a stable (module-level) function.
 */
function useRequest<T>(id: string, load: (id: string, signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const key = `${id}:${attempt}`;
  const [result, setResult] = useState<
    ({ key: string } & Exclude<RequestState<T>, { status: "loading" }>) | null
  >(null);

  useEffect(() => {
    const controller = new AbortController();
    load(id, controller.signal)
      .then((data) => setResult({ key, status: "success", data }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ key, status: "error", message: getErrorMessage(error) });
        }
      });
    return () => controller.abort();
  }, [id, key, load]);

  // A result for a previous id or attempt counts as still loading.
  const state: RequestState<T> = result?.key === key ? result : { status: "loading" };
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}

/** Resolves to null instead of rejecting, unless the request was cancelled. */
function optional<T>(promise: Promise<T>, signal: AbortSignal): Promise<T | null> {
  return promise.catch((error: unknown) => {
    if (signal.aborted) throw error;
    return null;
  });
}

async function loadDetails(id: string, signal: AbortSignal) {
  const [pokemon, species] = await Promise.all([
    getPokemon(id, signal),
    optional(getPokemonSpeciesInfo(id, signal), signal),
  ]);
  return { pokemon, species };
}

/**
 * Loads a Pokemon and its species info in parallel. Only the Pokemon request
 * is required; if species info fails the screen still renders without it.
 */
export function usePokemonDetails(id: string) {
  return useRequest(id, loadDetails);
}

function getPokemonSpecies(idOrName: string | number, signal?: AbortSignal) {
  const key = encodeURIComponent(String(idOrName).trim().toLowerCase());
  return fetchJson<PokemonSpecies>(`/pokemon-species/${key}`, { signal });
}

function getType(name: string, signal?: AbortSignal) {
  return fetchJson<PokemonTypeDetails>(`/type/${encodeURIComponent(name)}`, { signal });
}

async function loadInsights(id: string, signal: AbortSignal): Promise<PokemonInsights> {
  const [pokemon, species] = await Promise.all([
    getPokemon(id, signal),
    optional(getPokemonSpecies(id, signal), signal),
  ]);
  const types = await Promise.all(pokemon.types.map(({ type }) => getType(type.name, signal)));
  return { pokemon, species, ...getDefensiveMatchups(types) };
}

/** Data for the stats sheet: Pokemon, raw species data and type matchups. */
export function usePokemonInsights(id: string) {
  return useRequest(id, loadInsights);
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

/** Fetch one page of the Pokemon index. */
export async function getPokemonList(
  offset = 0,
  limit = 50,
  signal?: AbortSignal,
): Promise<PokemonListPage> {
  const data = await fetchJson<{
    count: number;
    next: string | null;
    results: { name: string; url: string }[];
  }>(`/pokemon?offset=${offset}&limit=${limit}`, { signal });
  if (typeof data?.count !== "number" || !Array.isArray(data.results)) {
    throw new PokeApiError("PokeAPI sent an unexpected response.", "invalid");
  }
  return {
    count: data.count,
    next: data.next ?? null,
    results: data.results
      .map(({ name, url }) => ({ name, id: getIdFromUrl(url) }))
      .filter((item) => Number.isInteger(item.id)),
  };
}

/**
 * Paginated Pokemon index for list screens. Loads the first page on mount;
 * call `loadMore` (e.g. from onEndReached or a retry button) for the next one.
 * `hasMore` turns false once the last page has loaded.
 */
export function usePokemonList(pageSize = 50) {
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Refs so loadMore stays stable and can't fire twice for the same page.
  // controllerRef holds the in-flight request, or null when idle.
  const controllerRef = useRef<AbortController | null>(null);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);

  const loadMore = useCallback(async () => {
    if (controllerRef.current || !hasMoreRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const page = await getPokemonList(offsetRef.current, pageSize, controller.signal);
      offsetRef.current += page.results.length;
      // An empty page also ends the list, so a stale `next` link can't loop forever.
      hasMoreRef.current =
        page.next !== null && page.results.length > 0 && offsetRef.current < page.count;
      setPokemon((prev) => [...prev, ...page.results]);
      setTotal(page.count);
      setHasMore(hasMoreRef.current);
    } catch (e) {
      if (!controller.signal.aborted) setError(getErrorMessage(e));
    } finally {
      // Skip if this request was cancelled and a newer one has taken over.
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  }, [pageSize]);

  useEffect(() => {
    loadMore();
    return () => {
      controllerRef.current?.abort();
      // Cleared so a remount (e.g. React StrictMode in dev) can start a fresh request.
      controllerRef.current = null;
    };
  }, [loadMore]);

  return { pokemon, total, hasMore, loading, error, loadMore };
}

/** Resource URLs end in `/<id>/`, e.g. https://pokeapi.co/api/v2/pokemon/25/ */
function getIdFromUrl(url: string): number {
  return Number(url.split("/").filter(Boolean).pop());
}

/** Small sprite by id — avoids a details request per list row. */
export function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

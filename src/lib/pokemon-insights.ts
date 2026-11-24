import { TypeColors } from "@/constants/pokemon-types";
import type { PokemonDetails, PokemonTypeDetails, TypeMatchupGroup } from "@/types/pokemon";

const ALL_TYPES = Object.keys(TypeColors);

/**
 * Damage multipliers against a Pokemon with these defending types, grouped:
 * weaknesses (4x, 2x), resistances (1/2x, 1/4x) and immunities (0x).
 */
export function getDefensiveMatchups(types: PokemonTypeDetails[]) {
  const multipliers = new Map(ALL_TYPES.map((type) => [type, 1]));
  for (const { damage_relations: rel } of types) {
    const apply = (list: { name: string }[], factor: number) => {
      for (const { name } of list) {
        if (multipliers.has(name)) multipliers.set(name, multipliers.get(name)! * factor);
      }
    };
    apply(rel.double_damage_from, 2);
    apply(rel.half_damage_from, 0.5);
    apply(rel.no_damage_from, 0);
  }

  const group = (multiplier: number): TypeMatchupGroup => ({
    multiplier,
    types: ALL_TYPES.filter((type) => multipliers.get(type) === multiplier),
  });
  const nonEmpty = (groups: TypeMatchupGroup[]) => groups.filter((g) => g.types.length > 0);

  return {
    weaknesses: nonEmpty([group(4), group(2)]),
    resistances: nonEmpty([group(0.5), group(0.25)]),
    immunities: group(0).types,
  };
}

export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0.5) return "½×";
  if (multiplier === 0.25) return "¼×";
  return `${multiplier}×`;
}

/**
 * Level 100 stat range: min is 0 IVs, 0 EVs and a hindering nature; max is
 * 31 IVs, 252 EVs and a helpful nature (natures don't affect HP).
 */
export function getStatRange(statName: string, base: number): { min: number; max: number } {
  if (statName === "hp") {
    // Shedinja always has exactly 1 HP.
    if (base === 1) return { min: 1, max: 1 };
    return { min: 2 * base + 110, max: 2 * base + 204 };
  }
  return { min: Math.floor((2 * base + 5) * 0.9), max: Math.floor((2 * base + 99) * 1.1) };
}

/** Highest possible level 100 stat (Blissey's HP), used to scale range bars. */
export const MAX_LEVEL_100_STAT = 714;

/** A rough battle role read off the base stat spread. */
export function getArchetype(stats: PokemonDetails["stats"]): { label: string; detail: string } {
  const get = (name: string) => stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
  const [hp, atk, def, spa, spd, spe] = [
    get("hp"),
    get("attack"),
    get("defense"),
    get("special-attack"),
    get("special-defense"),
    get("speed"),
  ];
  const offense = Math.max(atk, spa);
  const bulk = (hp + def + spd) / 3;

  if (spe >= offense && spe >= bulk) {
    return { label: "Speedster", detail: "Speed is its standout stat — it usually moves first." };
  }
  if (bulk > offense) {
    if (def >= spd * 1.2) return { label: "Physical Wall", detail: "Built to absorb physical hits." };
    if (spd >= def * 1.2) return { label: "Special Wall", detail: "Built to absorb special attacks." };
    return { label: "Tank", detail: "Balanced bulk on both sides." };
  }
  const fast = spe >= 100 ? "Fast " : "";
  if (Math.abs(atk - spa) <= 10) {
    return { label: `${fast}Mixed Attacker`, detail: "Hits well with both physical and special moves." };
  }
  return atk > spa
    ? { label: `${fast}Physical Attacker`, detail: "Strongest with physical moves." }
    : { label: `${fast}Special Attacker`, detail: "Strongest with special moves." };
}

/** How a base stat total compares to the wider Pokedex. */
export function getTotalTier(total: number): string {
  if (total >= 600) return "Legendary tier";
  if (total >= 520) return "Elite";
  if (total >= 450) return "Strong";
  if (total >= 350) return "Average";
  return "Developing";
}

/**
 * Approximate chance to catch with a Poke Ball at full HP and no status,
 * using the Gen III+ formula (shake checks ignored).
 */
export function getCatchChance(captureRate: number): number {
  return Math.min(captureRate / 3 / 255, 1);
}

/** Female share between 0 and 1, or null when genderless. */
export function getFemaleRatio(genderRate: number): number | null {
  return genderRate < 0 ? null : genderRate / 8;
}

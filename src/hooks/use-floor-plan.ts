"use client";

import { useCachedResource } from "@/hooks/use-cached-resource";
import { listAreas, listTables } from "@/lib/api/areas";
import { areaErrorMessage } from "@/lib/area-errors";
import type { Area, DiningTable } from "@/types/area";

export type FloorArea = {
  area: Area;
  tables: DiningTable[];
};

const TTL_MS = 60_000;

async function loadFloorPlan(): Promise<FloorArea[]> {
  const areas = await listAreas("ACTIVE");
  const sorted = [...areas].sort((a, b) => a.name.localeCompare(b.name));
  const tables = await Promise.all(
    sorted.map((area) => listTables(area.id, "ACTIVE")),
  );
  return sorted.map((area, index) => ({
    area,
    tables: [...tables[index]].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    ),
  }));
}

/** Active areas with their active tables, for the reservations mapping view. */
export function useFloorPlan() {
  const { data, loading, error, refetch } = useCachedResource<FloorArea[]>({
    key: "floor-plan:ACTIVE",
    ttlMs: TTL_MS,
    mapError: (err) => areaErrorMessage(err, "Couldn't load areas and tables."),
    fetcher: loadFloorPlan,
  });

  return {
    floor: data ?? [],
    loading,
    error,
    refetch,
  };
}

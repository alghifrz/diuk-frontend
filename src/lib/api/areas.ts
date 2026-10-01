import { apiRequest, toQuery } from "@/lib/api/client";
import type {
  Area,
  AreaStatus,
  CreateAreaInput,
  CreateTableInput,
  DiningTable,
  UpdateAreaInput,
  UpdateTableInput,
} from "@/types/area";

export function listAreas(status?: AreaStatus | "") {
  return apiRequest<Area[]>(
    `/api/v1/areas${toQuery({ status: status || undefined })}`,
  );
}

export async function listAllAreas() {
  const [active, inactive] = await Promise.all([
    listAreas("ACTIVE"),
    listAreas("INACTIVE"),
  ]);
  return [...active, ...inactive].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function getArea(id: string) {
  return apiRequest<Area>(`/api/v1/areas/${id}`);
}

export function createArea(input: CreateAreaInput) {
  return apiRequest<Area>("/api/v1/areas", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description ?? null,
    }),
  });
}

export function updateArea(id: string, input: UpdateAreaInput) {
  return apiRequest<Area>(`/api/v1/areas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Soft-deactivates the area (backend DELETE). */
export function deactivateArea(id: string) {
  return apiRequest<Area>(`/api/v1/areas/${id}`, {
    method: "DELETE",
  });
}

export function listTables(areaId: string, status?: AreaStatus | "") {
  return apiRequest<DiningTable[]>(
    `/api/v1/areas/${areaId}/tables${toQuery({
      status: status || undefined,
    })}`,
  );
}

export async function listAllTables(areaId: string) {
  const [active, inactive] = await Promise.all([
    listTables(areaId, "ACTIVE"),
    listTables(areaId, "INACTIVE"),
  ]);
  return [...active, ...inactive].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function createTable(areaId: string, input: CreateTableInput) {
  return apiRequest<DiningTable>(`/api/v1/areas/${areaId}/tables`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      capacity: input.capacity,
    }),
  });
}

export function updateTable(
  areaId: string,
  tableId: string,
  input: UpdateTableInput,
) {
  return apiRequest<DiningTable>(
    `/api/v1/areas/${areaId}/tables/${tableId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

/** Soft-deactivates the table (backend DELETE). */
export function deactivateTable(areaId: string, tableId: string) {
  return apiRequest<DiningTable>(
    `/api/v1/areas/${areaId}/tables/${tableId}`,
    {
      method: "DELETE",
    },
  );
}

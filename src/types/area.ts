export type AreaStatus = "ACTIVE" | "INACTIVE";
export type TableStatus = "ACTIVE" | "INACTIVE";

export type Area = {
  id: string;
  name: string;
  description: string | null;
  status: AreaStatus;
  table_count: number;
  active_table_count: number;
  created_at: string;
  updated_at: string;
};

export type DiningTable = {
  id: string;
  area_id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  created_at: string;
  updated_at: string;
};

export type CreateAreaInput = {
  name: string;
  description?: string | null;
};

export type UpdateAreaInput = {
  name?: string;
  description?: string | null;
  status?: AreaStatus;
};

export type CreateTableInput = {
  name: string;
  capacity: number;
};

export type UpdateTableInput = {
  name?: string;
  capacity?: number;
  status?: TableStatus;
};

export type AreaStatusFilter = "ACTIVE" | "ALL";

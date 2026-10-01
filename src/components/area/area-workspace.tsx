"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AreaDialog } from "@/components/area/area-dialog";
import { AreaList } from "@/components/area/area-list";
import { ConfirmDialog } from "@/components/area/confirm-dialog";
import { EntityStatusBadge } from "@/components/area/status-badge";
import { TableDialog } from "@/components/area/table-dialog";
import { TableList } from "@/components/area/table-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAreaTables } from "@/hooks/use-area-tables";
import { useAreas } from "@/hooks/use-areas";
import { getArea } from "@/lib/api/areas";
import { areaErrorMessage } from "@/lib/area-errors";
import { cn } from "@/lib/cn";
import type {
  Area,
  AreaStatusFilter,
  DiningTable,
} from "@/types/area";

type ConfirmState =
  | { type: "area"; area: Area }
  | { type: "table"; table: DiningTable }
  | null;

export function AreaWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("area");

  const [statusFilter, setStatusFilter] = useState<AreaStatusFilter>("ACTIVE");
  const [tableFilter, setTableFilter] = useState<AreaStatusFilter>("ACTIVE");
  const areas = useAreas(statusFilter);
  const tables = useAreaTables(selectedId, tableFilter);

  const [areaDialog, setAreaDialog] = useState<"create" | "edit" | null>(null);
  const [areaDialogKey, setAreaDialogKey] = useState(0);
  const [tableDialog, setTableDialog] = useState<"create" | "edit" | null>(null);
  const [tableDialogKey, setTableDialogKey] = useState(0);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyTableId, setBusyTableId] = useState<string | null>(null);
  const [fetchedArea, setFetchedArea] = useState<Area | null>(null);
  const [fetchedFor, setFetchedFor] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState("");

  const selectedFromList = useMemo(
    () => areas.items.find((item) => item.id === selectedId) ?? null,
    [areas.items, selectedId],
  );

  const selectedArea = selectedFromList
    ?? (selectedId && fetchedFor === selectedId ? fetchedArea : null);
  const areaDetailError =
    selectedId && !selectedFromList && fetchedFor === selectedId
      ? fetchError
      : "";

  useEffect(() => {
    if (!selectedId || selectedFromList) {
      return;
    }

    let cancelled = false;

    getArea(selectedId)
      .then((area) => {
        if (cancelled) {
          return;
        }
        setFetchedArea(area);
        setFetchError("");
        setFetchedFor(selectedId);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setFetchedArea(null);
        setFetchError(areaErrorMessage(err, "Couldn't load this area."));
        setFetchedFor(selectedId);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, selectedFromList]);

  useEffect(() => {
    if (areas.loading || selectedId || areas.items.length === 0) {
      return;
    }
    const first =
      areas.items.find((item) => item.status === "ACTIVE") ?? areas.items[0];
    if (first) {
      router.replace(`/area?area=${first.id}`, { scroll: false });
    }
  }, [areas.items, areas.loading, router, selectedId]);

  const selectArea = useCallback(
    (id: string) => {
      router.replace(`/area?area=${id}`, { scroll: false });
      setActionError("");
      setTableFilter("ACTIVE");
    },
    [router],
  );

  const clearArea = useCallback(() => {
    router.replace("/area", { scroll: false });
    setActionError("");
  }, [router]);

  const activeSeats = useMemo(
    () =>
      tables.items
        .filter((table) => table.status === "ACTIVE")
        .reduce((sum, table) => sum + table.capacity, 0),
    [tables.items],
  );

  const activeTableCount = useMemo(
    () => tables.items.filter((table) => table.status === "ACTIVE").length,
    [tables.items],
  );

  async function handleDeactivateArea() {
    if (!confirm || confirm.type !== "area") {
      return;
    }
    setConfirmBusy(true);
    setConfirmError("");
    try {
      await areas.deactivate(confirm.area.id);
      setConfirm(null);
      if (selectedId === confirm.area.id) {
        clearArea();
      }
    } catch (err) {
      setConfirmError(
        areaErrorMessage(err, "Couldn't deactivate area."),
      );
    } finally {
      setConfirmBusy(false);
    }
  }

  async function handleDeactivateTable() {
    if (!confirm || confirm.type !== "table") {
      return;
    }
    setConfirmBusy(true);
    setConfirmError("");
    setBusyTableId(confirm.table.id);
    try {
      await tables.deactivate(confirm.table.id);
      if (selectedArea) {
        areas.upsert({
          ...selectedArea,
          active_table_count: Math.max(0, selectedArea.active_table_count - 1),
        });
      }
      setConfirm(null);
    } catch (err) {
      setConfirmError(
        areaErrorMessage(err, "Couldn't deactivate table."),
      );
    } finally {
      setConfirmBusy(false);
      setBusyTableId(null);
    }
  }

  async function handleReactivateTable(table: DiningTable) {
    setBusyTableId(table.id);
    setActionError("");
    try {
      await tables.update(table.id, { status: "ACTIVE" });
      if (selectedArea) {
        areas.upsert({
          ...selectedArea,
          active_table_count: selectedArea.active_table_count + 1,
        });
      }
    } catch (err) {
      setActionError(areaErrorMessage(err, "Couldn't reactivate table."));
    } finally {
      setBusyTableId(null);
    }
  }

  async function handleReactivateArea() {
    if (!selectedArea) {
      return;
    }
    setActionError("");
    try {
      const updated = await areas.update(selectedArea.id, {
        status: "ACTIVE",
      });
      areas.upsert(updated);
      setFetchedArea(updated);
      setFetchedFor(updated.id);
    } catch (err) {
      setActionError(areaErrorMessage(err, "Couldn't reactivate area."));
    }
  }

  const showMobileDetail = Boolean(selectedId);
  const canAddTables = selectedArea?.status === "ACTIVE";

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="hidden font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase lg:block">
            Floor plan structure
          </p>
          <div className="lg:hidden">
            <h2 className="text-base font-semibold text-on-surface">Area</h2>
            <p className="text-xs text-on-surface-variant">
              Manage dining areas and table capacity.
            </p>
          </div>
          <p className="mt-0.5 hidden text-sm text-on-surface-variant lg:block">
            Areas group tables used for reservations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-xl border border-outline-variant bg-background p-0.5"
            role="group"
            aria-label="Area status filter"
          >
            {(["ACTIVE", "ALL"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={cn(
                  "min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  statusFilter === value
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {value === "ACTIVE" ? "Active" : "All"}
              </button>
            ))}
          </div>
          <Button
            className="w-auto min-w-0 px-3 sm:px-4"
            onClick={() => {
              setAreaDialogKey((key) => key + 1);
              setAreaDialog("create");
            }}
          >
            <Icon name="add" size={18} />
            <span className="hidden sm:inline">Add Area</span>
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          className={cn(
            "absolute inset-0 grid min-h-0 lg:grid-cols-[minmax(260px,0.85fr)_minmax(340px,1.45fr)]",
            showMobileDetail ? "max-lg:hidden" : "",
          )}
        >
          <section className="flex min-h-0 flex-col border-r border-outline-variant bg-surface">
            <div className="flex items-center justify-between gap-2 border-b border-outline-variant px-4 py-2.5">
              <h3 className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
                Areas
              </h3>
              {!areas.loading && !areas.error ? (
                <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[11px] font-medium tabular-nums text-on-surface-variant">
                  {areas.items.length}
                </span>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {!areas.loading && !areas.error && areas.items.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-12 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                    <Icon name="map" size={24} />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-on-surface">
                    No areas yet
                  </p>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                    Create an area to start organizing your tables.
                  </p>
                  <div className="mt-5 w-full max-w-[160px]">
                    <Button
                      onClick={() => {
                        setAreaDialogKey((key) => key + 1);
                        setAreaDialog("create");
                      }}
                    >
                      <Icon name="add" size={18} />
                      Add Area
                    </Button>
                  </div>
                </div>
              ) : (
                <AreaList
                  items={areas.items}
                  selectedId={selectedId}
                  loading={areas.loading}
                  error={areas.error}
                  onSelect={selectArea}
                  onRetry={() => void areas.refetch()}
                />
              )}
            </div>
          </section>

          <section className="hidden min-h-0 flex-col overflow-hidden bg-background lg:flex">
            <AreaDetailPanel
              area={selectedArea}
              areaError={areaDetailError}
              actionError={actionError}
              tables={tables}
              tableFilter={tableFilter}
              activeTableCount={activeTableCount}
              activeSeats={activeSeats}
              busyTableId={busyTableId}
              canAddTables={canAddTables}
              onBack={undefined}
              onTableFilterChange={setTableFilter}
              onEditArea={() => {
                setAreaDialogKey((key) => key + 1);
                setAreaDialog("edit");
              }}
              onDeactivateArea={() => {
                if (selectedArea) {
                  setConfirmError("");
                  setConfirm({ type: "area", area: selectedArea });
                }
              }}
              onReactivateArea={() => void handleReactivateArea()}
              onAddTable={() => {
                setEditingTable(null);
                setTableDialogKey((key) => key + 1);
                setTableDialog("create");
              }}
              onEditTable={(table) => {
                setEditingTable(table);
                setTableDialogKey((key) => key + 1);
                setTableDialog("edit");
              }}
              onDeactivateTable={(table) => {
                setConfirmError("");
                setConfirm({ type: "table", table });
              }}
              onReactivateTable={(table) => void handleReactivateTable(table)}
            />
          </section>
        </div>

        <div
          className={cn(
            "absolute inset-0 bg-background lg:hidden",
            showMobileDetail ? "block" : "hidden",
          )}
        >
          <AreaDetailPanel
            area={selectedArea}
            areaError={areaDetailError}
            actionError={actionError}
            tables={tables}
            tableFilter={tableFilter}
            activeTableCount={activeTableCount}
            activeSeats={activeSeats}
            busyTableId={busyTableId}
            canAddTables={canAddTables}
            onBack={clearArea}
            onTableFilterChange={setTableFilter}
            onEditArea={() => {
              setAreaDialogKey((key) => key + 1);
              setAreaDialog("edit");
            }}
            onDeactivateArea={() => {
              if (selectedArea) {
                setConfirmError("");
                setConfirm({ type: "area", area: selectedArea });
              }
            }}
            onReactivateArea={() => void handleReactivateArea()}
            onAddTable={() => {
              setEditingTable(null);
              setTableDialogKey((key) => key + 1);
              setTableDialog("create");
            }}
            onEditTable={(table) => {
              setEditingTable(table);
              setTableDialogKey((key) => key + 1);
              setTableDialog("edit");
            }}
            onDeactivateTable={(table) => {
              setConfirmError("");
              setConfirm({ type: "table", table });
            }}
            onReactivateTable={(table) => void handleReactivateTable(table)}
          />
        </div>
      </div>

      <AreaDialog
        key={`area-dialog-${areaDialogKey}`}
        open={areaDialog !== null}
        mode={areaDialog === "edit" ? "edit" : "create"}
        area={areaDialog === "edit" ? selectedArea : null}
        onClose={() => setAreaDialog(null)}
        onCreate={areas.create}
        onUpdate={areas.update}
        onSaved={(area) => {
          areas.upsert(area);
          selectArea(area.id);
        }}
      />

      {selectedArea ? (
        <TableDialog
          key={`table-dialog-${tableDialogKey}`}
          open={tableDialog !== null}
          mode={tableDialog === "edit" ? "edit" : "create"}
          areaName={selectedArea.name}
          table={tableDialog === "edit" ? editingTable : null}
          onClose={() => {
            setTableDialog(null);
            setEditingTable(null);
          }}
          onCreate={tables.create}
          onUpdate={(id, input) => tables.update(id, input)}
          onSaved={(table) => {
            if (tableDialog === "create") {
              areas.upsert({
                ...selectedArea,
                table_count: selectedArea.table_count + 1,
                active_table_count: selectedArea.active_table_count + 1,
              });
            }
            void table;
            void tables.refetch();
            void areas.refetch();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={confirm?.type === "area"}
        title={
          confirm?.type === "area"
            ? `Deactivate ${confirm.area.name}?`
            : "Deactivate area?"
        }
        description="The area will no longer be available for new tables or reservations."
        confirmLabel="Deactivate"
        destructive
        loading={confirmBusy}
        error={confirmError}
        onClose={() => {
          if (!confirmBusy) {
            setConfirm(null);
          }
        }}
        onConfirm={() => void handleDeactivateArea()}
      />

      <ConfirmDialog
        open={confirm?.type === "table"}
        title={
          confirm?.type === "table"
            ? `Deactivate ${confirm.table.name}?`
            : "Deactivate table?"
        }
        description="The table will no longer be available for new reservations."
        confirmLabel="Deactivate"
        destructive
        loading={confirmBusy}
        error={confirmError}
        onClose={() => {
          if (!confirmBusy) {
            setConfirm(null);
          }
        }}
        onConfirm={() => void handleDeactivateTable()}
      />
    </div>
  );
}

type DetailPanelProps = {
  area: Area | null;
  areaError: string;
  actionError: string;
  tables: ReturnType<typeof useAreaTables>;
  tableFilter: AreaStatusFilter;
  activeTableCount: number;
  activeSeats: number;
  busyTableId: string | null;
  canAddTables: boolean;
  onBack?: () => void;
  onTableFilterChange: (filter: AreaStatusFilter) => void;
  onEditArea: () => void;
  onDeactivateArea: () => void;
  onReactivateArea: () => void;
  onAddTable: () => void;
  onEditTable: (table: DiningTable) => void;
  onDeactivateTable: (table: DiningTable) => void;
  onReactivateTable: (table: DiningTable) => void;
};

function AreaDetailPanel({
  area,
  areaError,
  actionError,
  tables,
  tableFilter,
  activeTableCount,
  activeSeats,
  busyTableId,
  canAddTables,
  onBack,
  onTableFilterChange,
  onEditArea,
  onDeactivateArea,
  onReactivateArea,
  onAddTable,
  onEditTable,
  onDeactivateTable,
  onReactivateTable,
}: DetailPanelProps) {
  if (areaError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-error/10 text-error">
          <Icon name="error" size={24} />
        </span>
        <p className="text-sm font-medium text-on-surface">{areaError}</p>
        {onBack ? (
          <Button variant="ghost" className="w-auto" onClick={onBack}>
            Back to areas
          </Button>
        ) : null}
      </div>
    );
  }

  if (!area) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant">
          <Icon name="map" size={28} />
        </span>
        <p className="mt-4 text-sm font-semibold text-on-surface">
          Select an area
        </p>
        <p className="mt-1 max-w-xs text-sm leading-6 text-on-surface-variant">
          Choose an area on the left to manage its tables and seating capacity.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-outline-variant bg-surface px-4 py-4 sm:px-5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="arrow_back" size={18} />
            Areas
          </button>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight text-on-surface">
                {area.name}
              </h2>
              <EntityStatusBadge status={area.status} />
            </div>
            {area.description ? (
              <p className="mt-1 max-w-xl text-sm leading-6 text-on-surface-variant">
                {area.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-on-surface-variant">
                No description
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container-low px-2.5 py-1.5 text-xs font-medium text-on-surface">
                <Icon name="table_restaurant" size={16} className="text-on-surface-variant" />
                {activeTableCount} tables
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container-low px-2.5 py-1.5 text-xs font-medium text-on-surface">
                <Icon name="event_seat" size={16} className="text-on-surface-variant" />
                {activeSeats} seats
              </span>
              {tableFilter === "ALL" ? (
                <span className="inline-flex items-center rounded-xl bg-background px-2.5 py-1.5 text-[11px] text-on-surface-variant">
                  Summary uses active tables
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="ghost"
              className="w-auto min-h-10 min-w-0 px-3"
              onClick={onEditArea}
              aria-label={`Edit ${area.name}`}
            >
              <Icon name="edit" size={18} />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            {area.status === "ACTIVE" ? (
              <Button
                variant="ghost"
                className="w-auto min-h-10 min-w-0 px-3"
                onClick={onDeactivateArea}
              >
                <Icon name="block" size={18} />
                <span className="hidden sm:inline">Deactivate</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-auto min-h-10 min-w-0 px-3"
                onClick={onReactivateArea}
              >
                <Icon name="check_circle" size={18} />
                <span className="hidden sm:inline">Reactivate</span>
              </Button>
            )}
            <Button
              className="w-auto min-w-0 px-3"
              onClick={onAddTable}
              disabled={!canAddTables}
              title={
                canAddTables
                  ? undefined
                  : "Reactivate this area before adding tables"
              }
            >
              <Icon name="add" size={18} />
              Add Table
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {actionError ? (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error"
          >
            <Icon name="error" size={18} />
            <span>{actionError}</span>
          </p>
        ) : null}

        {!canAddTables ? (
          <p className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm text-on-surface">
            This area is inactive. Reactivate it before creating new tables.
          </p>
        ) : null}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-on-surface">Tables</h3>
          <div
            className="inline-flex rounded-xl border border-outline-variant bg-surface p-0.5"
            role="group"
            aria-label="Table status filter"
          >
            {(["ACTIVE", "ALL"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onTableFilterChange(value)}
                className={cn(
                  "min-h-8 rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  tableFilter === value
                    ? "bg-background text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {value === "ACTIVE" ? "Active" : "All"}
              </button>
            ))}
          </div>
        </div>

        <TableList
          tables={tables.items}
          loading={tables.loading}
          error={tables.error}
          busyId={busyTableId}
          onRetry={() => void tables.refetch()}
          onEdit={onEditTable}
          onDeactivate={onDeactivateTable}
          onReactivate={onReactivateTable}
          onAdd={onAddTable}
          canAdd={canAddTables}
        />
      </div>
    </div>
  );
}

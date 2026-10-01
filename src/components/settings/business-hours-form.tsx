"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  getBusinessHours,
  replaceBusinessHours,
} from "@/lib/api/business";
import { toUserMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { WEEKDAYS, type BusinessHour } from "@/types/business";

type DayRow = {
  open: boolean;
  openTime: string;
  closeTime: string;
};

function emptyWeek(): DayRow[] {
  return WEEKDAYS.map(() => ({
    open: false,
    openTime: "09:00",
    closeTime: "22:00",
  }));
}

function fromApi(hours: BusinessHour[]): DayRow[] {
  const rows = emptyWeek();
  for (const hour of hours) {
    if (hour.sort_order !== 0) {
      continue;
    }
    if (hour.day_of_week < 0 || hour.day_of_week > 6) {
      continue;
    }
    rows[hour.day_of_week] = {
      open: true,
      openTime: hour.open_time.slice(0, 5),
      closeTime: hour.close_time.slice(0, 5),
    };
  }
  return rows;
}

export function BusinessHoursForm() {
  const [rows, setRows] = useState<DayRow[]>(emptyWeek);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getBusinessHours()
      .then((hours) => {
        if (cancelled) {
          return;
        }
        setRows(fromApi(hours));
        setError("");
        setLoaded(true);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(toUserMessage(err, "Couldn't load business hours."));
        setLoaded(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateDay(index: number, patch: Partial<DayRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    for (const [index, row] of rows.entries()) {
      if (!row.open) {
        continue;
      }
      if (!row.openTime || !row.closeTime) {
        setError(`${WEEKDAYS[index].label}: open and close times are required.`);
        setSaving(false);
        return;
      }
      if (row.openTime >= row.closeTime) {
        setError(`${WEEKDAYS[index].label}: open time must be before close time.`);
        setSaving(false);
        return;
      }
    }

    const payload = rows.flatMap((row, day) =>
      row.open
        ? [
            {
              day_of_week: day,
              sort_order: 0,
              open_time: row.openTime,
              close_time: row.closeTime,
            },
          ]
        : [],
    );

    try {
      const saved = await replaceBusinessHours(payload);
      setRows(fromApi(saved));
      setSuccess(
        payload.length === 0
          ? "Business is marked closed every day."
          : "Business hours saved.",
      );
    } catch (err) {
      setError(toUserMessage(err, "Couldn't save business hours."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon name="schedule" size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
            Schedule
          </p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-on-surface">
            Business hours
          </h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            Reservations can only be booked inside these hours.
          </p>
        </div>
      </div>

      {loading || !loaded ? (
        <div className="mt-5 space-y-2" aria-busy="true" aria-label="Loading hours">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-xl bg-surface-container-low"
            />
          ))}
        </div>
      ) : (
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-3">
          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error"
            >
              <Icon name="error" size={18} />
              <span>{error}</span>
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-sm text-success"
            >
              <Icon name="check_circle" size={18} />
              <span>{success}</span>
            </p>
          ) : null}

          <ul className="space-y-2">
            {WEEKDAYS.map((day, index) => {
              const row = rows[index];
              return (
                <li
                  key={day.day}
                  className="rounded-2xl border border-outline-variant bg-background px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex min-w-[7.5rem] items-center gap-2 text-sm font-medium text-on-surface">
                      <input
                        type="checkbox"
                        checked={row.open}
                        onChange={(event) =>
                          updateDay(index, { open: event.target.checked })
                        }
                        className="size-4 rounded border-outline-variant text-primary focus-visible:ring-2 focus-visible:ring-primary"
                      />
                      {day.label}
                    </label>

                    {row.open ? (
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                          <span className="sr-only">{day.label} open</span>
                          <input
                            type="time"
                            value={row.openTime}
                            onChange={(event) =>
                              updateDay(index, { openTime: event.target.value })
                            }
                            className="min-h-10 rounded-xl border border-outline-variant bg-surface px-2 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                            required
                          />
                        </label>
                        <span className="text-xs text-on-surface-variant">to</span>
                        <label className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                          <span className="sr-only">{day.label} close</span>
                          <input
                            type="time"
                            value={row.closeTime}
                            onChange={(event) =>
                              updateDay(index, { closeTime: event.target.value })
                            }
                            className="min-h-10 rounded-xl border border-outline-variant bg-surface px-2 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                            required
                          />
                        </label>
                      </div>
                    ) : (
                      <span
                        className={cn(
                          "text-sm text-on-surface-variant",
                          "rounded-lg bg-surface-container-low px-2.5 py-1",
                        )}
                      >
                        Closed
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="pt-2 sm:max-w-[12rem]">
            <Button type="submit" loading={saving}>
              Save hours
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

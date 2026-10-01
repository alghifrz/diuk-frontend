"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  createScheduleException,
  deleteScheduleException,
  listScheduleExceptions,
} from "@/lib/api/business";
import { toUserMessage } from "@/lib/api/errors";
import type { ScheduleException } from "@/types/business";

export function ScheduleExceptionsForm() {
  const [items, setItems] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [date, setDate] = useState("");
  const [closed, setClosed] = useState(true);
  const [openTime, setOpenTime] = useState("10:00");
  const [closeTime, setCloseTime] = useState("16:00");
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    listScheduleExceptions()
      .then((rows) => {
        if (cancelled) {
          return;
        }
        setItems(rows);
        setError("");
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(toUserMessage(err, "Couldn't load schedule exceptions."));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) {
      setError("Exception date is required.");
      return;
    }
    if (!closed && (!openTime || !closeTime || openTime >= closeTime)) {
      setError("Custom hours need a valid open and close time.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const created = await createScheduleException({
        exception_date: date,
        is_closed: closed,
        open_time: closed ? null : openTime,
        close_time: closed ? null : closeTime,
        note: note.trim() || null,
      });
      setItems((current) =>
        [...current, created].sort((a, b) =>
          a.exception_date.localeCompare(b.exception_date),
        ),
      );
      setDate("");
      setNote("");
      setClosed(true);
      setSuccess("Exception added.");
    } catch (err) {
      setError(toUserMessage(err, "Couldn't add schedule exception."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError("");
    setSuccess("");

    try {
      await deleteScheduleException(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setSuccess("Exception removed.");
    } catch (err) {
      setError(toUserMessage(err, "Couldn't remove schedule exception."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card padding="lg">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning">
          <Icon name="event_busy" size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
            Exceptions
          </p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-on-surface">
            Schedule exceptions
          </h2>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            Close a day or override hours for holidays and special dates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-2" aria-busy="true" aria-label="Loading exceptions">
          <div className="h-14 animate-pulse rounded-xl bg-surface-container-low" />
          <div className="h-14 animate-pulse rounded-xl bg-surface-container-low" />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
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

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-6 text-center">
              <p className="text-sm font-medium text-on-surface">No exceptions</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Weekly hours apply unless you add an exception.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-background px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface">
                      {item.exception_date}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {item.is_closed
                        ? "Closed"
                        : `${item.open_time ?? "—"} – ${item.close_time ?? "—"}`}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-auto min-w-0 px-3"
                    loading={busyId === item.id}
                    onClick={() => void handleDelete(item.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={(event) => void handleCreate(event)}
            className="space-y-3 rounded-2xl border border-outline-variant bg-background p-3"
          >
            <p className="text-sm font-semibold text-on-surface">Add exception</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setSuccess("");
                }}
                required
              />
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-on-surface">Type</span>
                <select
                  value={closed ? "closed" : "hours"}
                  onChange={(event) => {
                    setClosed(event.target.value === "closed");
                    setSuccess("");
                  }}
                  className="min-h-11 rounded-xl border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  <option value="closed">Closed all day</option>
                  <option value="hours">Custom hours</option>
                </select>
              </label>
              {!closed ? (
                <>
                  <Input
                    label="Open"
                    type="time"
                    value={openTime}
                    onChange={(event) => setOpenTime(event.target.value)}
                    required
                  />
                  <Input
                    label="Close"
                    type="time"
                    value={closeTime}
                    onChange={(event) => setCloseTime(event.target.value)}
                    required
                  />
                </>
              ) : null}
              <div className="sm:col-span-2">
                <Input
                  label="Note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="sm:max-w-[12rem]">
              <Button type="submit" loading={saving}>
                Add exception
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}

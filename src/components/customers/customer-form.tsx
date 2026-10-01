"use client";

import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/reservations/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCustomer, updateCustomer } from "@/lib/api/customers";
import { customerErrorMessage } from "@/lib/customer-errors";
import type { Customer } from "@/types/customer";

type CustomerFormProps = {
  open: boolean;
  /** When provided the dialog edits this customer; otherwise it creates one. */
  customer?: Customer | null;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
};

/** Mount with a fresh `key` per open so state resets without effects. */
export function CustomerForm({
  open,
  customer,
  onClose,
  onSaved,
}: CustomerFormProps) {
  const editing = Boolean(customer);
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [optIn, setOptIn] = useState(customer?.marketing_opt_in ?? true);
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required.");
      return;
    }

    setNameError("");
    setSubmitError("");
    setSubmitting(true);

    try {
      const saved = customer
        ? await updateCustomer(customer.id, {
            name: trimmed,
            phone: phone.trim(),
            email: email.trim(),
            notes: notes.trim(),
            marketing_opt_in: optIn,
          })
        : await createCustomer({
            name: trimmed,
            phone: phone.trim(),
            email: email.trim(),
            notes: notes.trim(),
            marketing_opt_in: optIn,
          });
      onSaved(saved);
      onClose();
    } catch (err) {
      setSubmitError(
        customerErrorMessage(
          err,
          editing ? "Couldn't save changes." : "Couldn't add customer.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit customer" : "Add customer"}
      description={
        editing
          ? "Update contact details and preferences."
          : "Create a customer profile you can book and message."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-auto min-w-24"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="w-auto min-w-28"
            loading={submitting}
            type="submit"
            form="customer-form"
          >
            {editing ? "Save changes" : "Add customer"}
          </Button>
        </div>
      }
    >
      <form
        id="customer-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Name"
          name="customer-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={nameError}
          autoFocus
          maxLength={150}
          leadingIcon="person"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            name="customer-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+62…"
            maxLength={30}
            leadingIcon="call"
          />
          <Input
            label="Email"
            name="customer-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            leadingIcon="mail"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="customer-notes"
            className="text-sm font-medium text-on-surface"
          >
            Notes
          </label>
          <textarea
            id="customer-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Allergies, seating preferences, anniversaries…"
            className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant bg-background px-3 py-3">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(event) => setOptIn(event.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>
            <span className="block text-sm font-medium text-on-surface">
              Okay to receive promotions
            </span>
            <span className="block text-xs text-on-surface-variant">
              Used when you send campaigns and reminders.
            </span>
          </span>
        </label>

        {submitError ? (
          <p role="alert" className="text-sm text-error">
            {submitError}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}

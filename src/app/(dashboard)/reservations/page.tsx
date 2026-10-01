import { Suspense } from "react";
import { ReservationWorkspace } from "@/components/reservations/reservation-workspace";

export const metadata = {
  title: "Reservations",
};

export default function ReservationsPage() {
  return (
    <Suspense fallback={<div className="h-full bg-background" aria-hidden />}>
      <ReservationWorkspace />
    </Suspense>
  );
}

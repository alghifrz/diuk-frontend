import { apiRequest, toQuery } from "@/lib/api/client";
import type { CalendarDayView } from "@/types/reservation";

export function getCalendarDay(params: {
  date: string;
  area_id?: string;
  table_id?: string;
}) {
  return apiRequest<CalendarDayView>(
    `/api/v1/calendar/day${toQuery({
      date: params.date,
      area_id: params.area_id,
      table_id: params.table_id,
    })}`,
  );
}

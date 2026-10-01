import { apiRequest } from "@/lib/api/client";
import type {
  BusinessHour,
  BusinessHourInput,
  CreateScheduleExceptionInput,
  ScheduleException,
  UpdateBusinessProfileInput,
  UpdateFnbSettingsInput,
} from "@/types/business";
import type { BusinessProfile, FnbSettings } from "@/types/reservation";

export function getBusinessProfile() {
  return apiRequest<BusinessProfile>("/api/v1/business");
}

export function updateBusinessProfile(input: UpdateBusinessProfileInput) {
  return apiRequest<BusinessProfile>("/api/v1/business", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getFnbSettings() {
  return apiRequest<FnbSettings>("/api/v1/business/fnb-settings");
}

export function updateFnbSettings(input: UpdateFnbSettingsInput) {
  return apiRequest<FnbSettings>("/api/v1/business/fnb-settings", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function getBusinessHours() {
  return apiRequest<BusinessHour[]>("/api/v1/business/hours");
}

export function replaceBusinessHours(hours: BusinessHourInput[]) {
  return apiRequest<BusinessHour[]>("/api/v1/business/hours", {
    method: "PUT",
    body: JSON.stringify({ hours }),
  });
}

export function listScheduleExceptions() {
  return apiRequest<ScheduleException[]>(
    "/api/v1/business/schedule-exceptions",
  );
}

export function createScheduleException(input: CreateScheduleExceptionInput) {
  return apiRequest<ScheduleException>(
    "/api/v1/business/schedule-exceptions",
    {
      method: "POST",
      body: JSON.stringify({
        exception_date: input.exception_date,
        is_closed: input.is_closed,
        open_time: input.open_time ?? null,
        close_time: input.close_time ?? null,
        note: input.note ?? null,
      }),
    },
  );
}

export function deleteScheduleException(id: string) {
  return apiRequest<null>(`/api/v1/business/schedule-exceptions/${id}`, {
    method: "DELETE",
  });
}

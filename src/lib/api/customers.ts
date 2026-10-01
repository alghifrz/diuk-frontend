import { apiRequest, toQuery } from "@/lib/api/client";
import type {
  Customer,
  CustomerInput,
  CustomerSort,
  CustomerTag,
} from "@/types/customer";

export function getCustomer(id: string) {
  return apiRequest<Customer>(`/api/v1/customers/${id}`);
}

export function listCustomers(params: {
  search?: string;
  status?: string;
  tag_id?: string;
  sort?: CustomerSort;
  limit?: number;
  offset?: number;
} = {}) {
  return apiRequest<Customer[]>(
    `/api/v1/customers${toQuery({
      search: params.search,
      status: params.status,
      tag_id: params.tag_id,
      sort: params.sort,
      limit: params.limit,
      offset: params.offset,
    })}`,
  );
}

export function createCustomer(input: CustomerInput) {
  return apiRequest<Customer>("/api/v1/customers", {
    method: "POST",
    body: JSON.stringify(cleanInput(input)),
  });
}

/**
 * PATCH semantics: omitted fields are untouched; empty strings clear
 * optional fields (the backend normalizes "" to null).
 */
export function updateCustomer(id: string, input: Partial<CustomerInput>) {
  return apiRequest<Customer>(`/api/v1/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function archiveCustomer(id: string) {
  return apiRequest<Customer>(`/api/v1/customers/${id}`, {
    method: "DELETE",
  });
}

export function listTags(status: "ACTIVE" | "INACTIVE" = "ACTIVE") {
  return apiRequest<CustomerTag[]>(`/api/v1/tags${toQuery({ status })}`);
}

export function createTag(input: { name: string; description?: string }) {
  return apiRequest<CustomerTag>("/api/v1/tags", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function assignCustomerTag(customerId: string, tagId: string) {
  return apiRequest<CustomerTag>(
    `/api/v1/customers/${customerId}/tags/${tagId}`,
    { method: "POST" },
  );
}

export function unassignCustomerTag(customerId: string, tagId: string) {
  return apiRequest<void>(`/api/v1/customers/${customerId}/tags/${tagId}`, {
    method: "DELETE",
  });
}

function cleanInput(input: CustomerInput) {
  const body: Record<string, string | boolean> = { name: input.name };
  if (input.phone) {
    body.phone = input.phone;
  }
  if (input.email) {
    body.email = input.email;
  }
  if (input.notes) {
    body.notes = input.notes;
  }
  if (input.marketing_opt_in !== undefined) {
    body.marketing_opt_in = input.marketing_opt_in;
  }
  return body;
}

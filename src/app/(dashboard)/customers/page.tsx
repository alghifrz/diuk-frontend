import { Suspense } from "react";
import { CustomerWorkspace } from "@/components/customers/customer-workspace";

export const metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="h-full bg-background" aria-hidden />}>
      <CustomerWorkspace />
    </Suspense>
  );
}

import { redirect } from "next/navigation";

/** Analysis and Report were merged into a single Analytics page. */
export default function AnalysisPage() {
  redirect("/analytics");
}

import { Suspense } from "react";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <DashboardPage />
    </Suspense>
  );
}

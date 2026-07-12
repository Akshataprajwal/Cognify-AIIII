import { AdminLayout } from "@/components/admin/AdminLayout";
import { GenerationLogs } from "@/components/admin/GenerationLogs";

export default function GenerationsPage() {
  return (
    <AdminLayout>
      <GenerationLogs />
    </AdminLayout>
  );
}

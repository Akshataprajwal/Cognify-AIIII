import { AdminLayout } from "@/components/admin/AdminLayout";
import { SystemStatus } from "@/components/admin/SystemStatus";

export default function SystemPage() {
  return (
    <AdminLayout>
      <SystemStatus />
    </AdminLayout>
  );
}

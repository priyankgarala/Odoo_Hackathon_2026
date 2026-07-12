export function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
        <p className="text-muted-foreground">Log repairs and manage vehicle shop status</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Creating a log sets vehicle to In Shop. API: <code>/api/maintenance</code>
      </p>
    </div>
  );
}

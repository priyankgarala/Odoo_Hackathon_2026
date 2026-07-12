export function DriversPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Driver Management</h2>
        <p className="text-muted-foreground">Track licenses, safety scores, and compliance</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Build CRUD table with license expiry badges. API: <code>/api/drivers</code>
      </p>
    </div>
  );
}

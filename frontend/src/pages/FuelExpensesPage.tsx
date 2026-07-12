export function FuelExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Fuel & Expenses</h2>
        <p className="text-muted-foreground">Track fuel logs and operational expenses</p>
      </div>
      <p className="text-sm text-muted-foreground">
        APIs: <code>/api/fuel-logs</code> and <code>/api/expenses</code>
      </p>
    </div>
  );
}

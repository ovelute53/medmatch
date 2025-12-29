export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <a href="/admin" style={{ fontWeight: 700, textDecoration: "none" }}>Admin</a>
        <nav style={{ display: "flex", gap: 12 }}>
          <a href="/admin/hospitals/new">병원 등록</a>
        </nav>
      </header>
      {children}
    </div>
  );
}

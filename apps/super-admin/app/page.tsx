const navigation = ["Dashboard", "Tenants", "Institutions", "Users", "Roles & permissions", "Module activation", "Audit logs"];

export default function SuperAdminPage() {
  return (
    <main className="portal">
      <aside className="sidebar"><div className="brand">CITIS <span>Platform</span></div><p className="eyebrow">Super Admin</p><nav>{navigation.map((item) => <a href="#" key={item}>{item}</a>)}</nav></aside>
      <section className="content"><header><div><p className="eyebrow">Foundation workspace</p><h1>Platform administration</h1><p className="muted">Manage tenants, institutional access, permissions, and platform modules.</p></div><button type="button">Sign in</button></header><div className="grid">{[["Tenants", "0 active tenant workspaces"], ["Institutions", "Set up campuses and institution profiles"], ["Access control", "Database-backed roles and permissions"], ["Audit logs", "Trace every state-changing action"]].map(([title, copy]) => <article key={title}><p className="eyebrow">Foundation</p><h2>{title}</h2><p className="muted">{copy}</p><span className="status">Ready for setup</span></article>)}</div><div className="notice"><strong>Protected portal shell</strong><span>Sign-in and tenant context are provided by the foundation API at /api/v1.</span></div></section>
    </main>
  );
}
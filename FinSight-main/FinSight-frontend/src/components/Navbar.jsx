import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { label: "Home",        path: "/" },
    { label: "Individual",  path: "/upload/individual" },
    { label: "SME",         path: "/upload/sme" },
  ];

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      width: "100%",
      background: "rgba(2,6,23,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "0 24px",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
      }}>
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}>
            📈
          </div>
          <span style={{
            fontSize: "18px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em",
          }}>
            FinSight
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {links.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                background: pathname === path
                  ? "rgba(59,130,246,0.15)"
                  : "transparent",
                border: "none",
                color: pathname === path ? "#3b82f6" : "#94a3b8",
                fontSize: "14px",
                fontWeight: pathname === path ? "600" : "400",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
            transition: "all 0.2s ease",
          }}
        >
          New Analysis
        </button>
      </div>
    </nav>
  );
}

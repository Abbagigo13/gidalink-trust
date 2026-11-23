import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FlaskConical,
  Flag,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "../context/auth-context";
import { signOut } from "../services/auth";
import type { AccountRole } from "../types";
import "./dashboard.css";

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  roles: AccountRole[];
  end?: boolean;
};

const items: NavItem[] = [
  { to: "/app", label: "Overview", icon: <LayoutDashboard size={17} />, roles: ["buyer", "landlord", "agent", "verifier", "admin"], end: true },
  { to: "/app/listings", label: "My listings", icon: <Building2 size={17} />, roles: ["landlord", "agent", "admin"] },
  { to: "/app/saved", label: "Saved", icon: <Heart size={17} />, roles: ["buyer", "landlord", "agent", "verifier", "admin"] },
  { to: "/app/inspections", label: "Inspections", icon: <CalendarCheck size={17} />, roles: ["buyer", "landlord", "agent", "verifier", "admin"] },
  { to: "/app/review", label: "Verification queue", icon: <ClipboardCheck size={17} />, roles: ["verifier", "admin"] },
  { to: "/app/reports", label: "Reports", icon: <Flag size={17} />, roles: ["verifier", "admin"] },
  { to: "/app/admin", label: "Admin", icon: <Users size={17} />, roles: ["admin"] },
  { to: "/app/quality", label: "Kane quality", icon: <FlaskConical size={17} />, roles: ["verifier", "admin"] },
];

export default function DashboardLayout() {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const visible = items.filter((item) => role && item.roles.includes(role));

  const logout = async () => {
    // Leave /app first. Clearing the session while this layout is mounted would make the
    // route guard redirect to /auth before we reach the home page.
    navigate("/", { replace: true });
    await signOut();
  };

  return (
    <div className="dash-shell">
      <aside className={`dash-sidebar ${open ? "open" : ""}`}>
        <NavLink to="/" className="dash-brand" onClick={() => setOpen(false)}>
          <span className="brand-symbol">G.</span>
          <span>
            gidalink<span className="brand-light">trust</span>
          </span>
        </NavLink>

        <nav aria-label="Dashboard">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "dash-link active" : "dash-link")}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-user">
          <div className="dash-user-meta">
            <strong>{profile?.full_name || "Your account"}</strong>
            <span className="role-pill" data-testid="role-pill">
              <ShieldCheck size={12} /> {role}
            </span>
          </div>
          <button className="dash-logout" onClick={logout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="dash-main">
        <div className="dash-topbar">
          <button
            className="dash-menu"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="dash-topbar-title">
            <Activity size={14} /> Dashboard
          </span>
        </div>
        <div className="dash-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/",          label: "Home" },
  { to: "/projects",  label: "Projects" },
  { to: "/skills",    label: "Skills" },
  { to: "/awards",    label: "Awards" },
  { to: "/certs",     label: "Certs" },
  { to: "/homelab",   label: "Homelab" },
  { to: "/calendar",  label: "Calendar" },
  { to: "/blog",      label: "Blog" },
  { to: "/contact",   label: "Contact" },
];

export default function Navigation() {
  return (
    <nav className="nav" aria-label="Primary">
      <div className="nav-pill" role="tablist">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            className="nav-item"
          >
            {({ isActive }) => (
              <>
                <span className="nav-mark" aria-hidden />
                <span>{it.label}</span>
                {isActive ? <span className="visually-hidden">(current)</span> : null}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

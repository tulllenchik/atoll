import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import mark from "../assets/images/mark.png";
import wordmark from "../assets/images/wordmark.svg";
import styles from "./Header.module.css";

const TABS = [
  { to: "/", label: "Обзор", end: true },
  { to: "/devices", label: "Устройства", end: false },
  { to: "/scenes", label: "Сценарии", end: true },
];

export function Tabs() {
  return (
    <nav className={styles.tabs} aria-label="Разделы">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => (isActive ? `${styles.tab} ${styles.tabOn}` : styles.tab)}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Header({ title, documentTitle = title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const rootScreen = location.pathname === "/" || location.pathname === "/devices" || location.pathname === "/scenes";
  const canBack = !rootScreen && location.key !== "default" && (window.history.state?.idx ?? 0) > 0;

  useEffect(() => {
    document.title = documentTitle ? `${documentTitle} — Атолл` : "Атолл";
  }, [documentTitle]);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        {canBack && (
          <button type="button" className={styles.back} onClick={() => navigate(-1)}>
            Назад
          </button>
        )}
        <NavLink to="/" className={`${styles.brand} ${styles.brandEnd}`} end aria-label="Атолл">
          <img className={styles.mark} src={mark} width="32" height="32" alt="" />
          <img className={styles.wordmark} src={wordmark} width="89" height="16" alt="" />
        </NavLink>
      </div>
      {title && <h1>{title}</h1>}
    </header>
  );
}

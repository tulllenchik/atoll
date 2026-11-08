import styles from "./Toggle.module.css";

export default function Toggle({ pressed, label, onClick }) {
  return (
    <button
      type="button"
      className={pressed ? `${styles.switch} ${styles.on}` : styles.switch}
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
    >
      <span />
    </button>
  );
}

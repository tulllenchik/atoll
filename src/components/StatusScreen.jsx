import styles from "./StatusScreen.module.css";

export default function StatusScreen({ kind, onRetry }) {
  if (kind === "loading") {
    return (
      <div className={styles.screen} role="status">
        <h1>Дом</h1>
        <p>Читаем приборы и погоду у дома.</p>
      </div>
    );
  }

  return (
    <div className={styles.screen} role="alert">
      <h1>Обрыв</h1>
      <p>Каталог квартиры не пришёл. Проверьте сеть и запросите его снова.</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        Повторить
      </button>
    </div>
  );
}

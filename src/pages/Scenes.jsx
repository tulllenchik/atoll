import { Link } from "react-router-dom";
import { useHome } from "../context/HomeContext";
import styles from "./Scenes.module.css";

export default function Scenes() {
  const { devices, scenes, sceneId, applyScene } = useHome();

  return (
    <div className={`page ${styles.page}`}>
      <header className={styles.intro}>
        <h1>Сценарии</h1>
        <p>
          Сценарий меняет сразу несколько устройств. Отдельный переключатель потом снимает сценарий: дом снова слушает
          каждую кнопку.
        </p>
      </header>
      {scenes.length === 0 ? (
        <p className={styles.empty}>Сценариев пока нет. Добавьте первый кнопкой с плюсом.</p>
      ) : (
        <div className={styles.grid}>
          {scenes.map((scene) => {
            const names = devices.filter((device) => scene.patch[device.id]);
            const active = sceneId === scene.id;
            return (
              <article key={scene.id} className={active ? styles.cardOn : styles.card}>
                <button type="button" className={styles.apply} aria-pressed={active} onClick={() => applyScene(scene.id)}>
                  <b>{scene.title}</b>
                  <span>{names.length > 0 ? scene.text : "В квартире нет устройств для этого сценария."}</span>
                </button>
                <Link to={`/scenes/${scene.id}/edit`} className={styles.edit}>
                  Изменить
                </Link>
              </article>
            );
          })}
        </div>
      )}
      <Link to="/scenes/new" className={styles.add} aria-label="Добавить сценарий">
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <path d="M11 3v16M3 11h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}

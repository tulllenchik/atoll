import { useState } from "react";
import { Link } from "react-router-dom";
import { useHome } from "../context/HomeContext";
import { ROOMS, TYPES, countLine, formatDay, isSensor, statusText } from "../lib/home";
import styles from "./Home.module.css";

function notable(device) {
  if (device.type === "lock") return !device.on;
  return device.on;
}

export default function Home() {
  const { devices } = useHome();
  const [view, setView] = useState("types");
  const powered = devices.filter((device) => device.type !== "lock");
  const poweredOn = powered.filter((device) => device.on).length;
  const working = devices.filter(notable);

  return (
    <div className="page">
      <header className={styles.intro}>
        <p className={styles.date}>{formatDay()}</p>
        <h1>Дом</h1>
        <p className={styles.address}>Проспект Вернадского, 78, Москва</p>
        <p className={styles.summary}>{countLine(poweredOn, powered.length)}</p>
      </header>

      <div className={styles.switcher} role="group" aria-label="Как смотреть дом">
        <button type="button" className={view === "types" ? styles.modeOn : styles.mode} aria-pressed={view === "types"} onClick={() => setView("types")}>
          По категориям
        </button>
        <button type="button" className={view === "rooms" ? styles.modeOn : styles.mode} aria-pressed={view === "rooms"} onClick={() => setView("rooms")}>
          По комнатам
        </button>
      </div>

      <div className={styles.rows}>
        {view === "types"
          ? Object.entries(TYPES).map(([id, label]) => {
              const group = devices.filter((device) => device.type === id);
              const on = group.filter((device) => device.on).length;
              const active = group.some((device) => device.on);
              const word = id === "lock" ? "закрыто" : "включено";
              return (
                <Link key={id} to={`/devices?type=${id}`} className={active ? styles.rowOn : styles.row}>
                  <b>{label}</b>
                  <span>{countLine(on, group.length, word)}</span>
                </Link>
              );
            })
          : Object.entries(ROOMS).map(([id, label]) => {
              const group = devices.filter((device) => device.room === id);
              const on = group.filter((device) => device.type !== "lock" && device.on).length;
              const total = group.filter((device) => device.type !== "lock").length;
              const active = group.some(notable);
              return (
                <Link key={id} to={`/devices?room=${id}`} className={active ? styles.rowOn : styles.row}>
                  <b>{label}</b>
                  <span>{countLine(on, total)}</span>
                </Link>
              );
            })}
      </div>

      {working.length > 0 && (
        <section className={styles.now}>
          <h2>Устройства</h2>
          <ul>
            {working.map((device) => (
              <li key={device.id}>
                <Link to={`/devices/${device.id}`}>
                  <b>{device.name}</b>
                  {isSensor(device) ? (
                    <span className={styles.readings}>
                      <span>Температура {device.level}°</span>
                      <span>Влажность {device.humidity}%</span>
                    </span>
                  ) : (
                    <span>{statusText(device)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

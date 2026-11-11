import { Link, useNavigate, useParams } from "react-router-dom";
import { useHome } from "../context/HomeContext";
import { LOCK_MODES, ROOMS, TYPES, formatLevel, isSensor, levelRange, lockMode, statusText } from "../lib/home";
import styles from "./DeviceDetail.module.css";

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devices, weather, toggleDevice, setLockMode, setLevel, deleteDevice } = useHome();
  const device = devices.find((item) => item.id === id);

  if (!device) {
    return (
      <div className={styles.missing}>
        <h2>Такого устройства нет</h2>
        <p>Оно могло быть удалено в этом браузере.</p>
        <Link to="/devices" className="btn btn-primary">
          К устройствам
        </Link>
      </div>
    );
  }

  const sensor = isSensor(device);
  const range = sensor ? null : levelRange(device.type);

  return (
    <article className={styles.card}>
      <p className={styles.meta}>
        {TYPES[device.type]} · {ROOMS[device.room]}
        {sensor && weather ? " · улица у дома" : ""}
      </p>
      <h1>{device.name}</h1>
      {sensor ? (
        <div className={styles.readout}>
          <p>
            <span>Температура</span>
            <b>{device.level}°</b>
          </p>
          <p>
            <span>Влажность</span>
            <b>{device.humidity}%</b>
          </p>
        </div>
      ) : device.type === "lock" ? (
        <div className={styles.lockModes} role="group" aria-label="Состояние замка">
          {LOCK_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={lockMode(device) === mode.id ? styles.modeOn : styles.mode}
              aria-pressed={lockMode(device) === mode.id}
              onClick={() => setLockMode(device.id, mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          className={device.on ? styles.statusOn : styles.status}
          aria-pressed={device.on}
          onClick={() => toggleDevice(device.id)}
        >
          {statusText(device)}
        </button>
      )}
      <p className={styles.note}>{device.note}</p>

      {range && (
        <label className={styles.slider}>
          {range.label}
          <input
            type="range"
            min={range.min}
            max={range.max}
            value={device.level}
            onChange={(event) => setLevel(device.id, Number(event.target.value))}
          />
          <b>{formatLevel(device.type, device.level)}</b>
        </label>
      )}

      <div className="actions">
        <Link to={`/devices/${device.id}/edit`} className="btn btn-primary">
          Изменить
        </Link>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            deleteDevice(device.id);
            navigate("/devices");
          }}
        >
          Удалить
        </button>
      </div>
    </article>
  );
}

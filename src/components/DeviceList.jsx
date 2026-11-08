import { Link } from "react-router-dom";
import { isSensor, statusText } from "../lib/home";
import Toggle from "./Toggle";
import styles from "./DeviceList.module.css";

export default function DeviceList({ devices, onToggle }) {
  if (devices.length === 0) return null;

  return (
    <ul className={styles.list}>
      {devices.map((device) => (
        <li key={device.id} className={styles.item}>
          <Link to={`/devices/${device.id}`} className={styles.title}>
            <b>{device.name}</b>
            {isSensor(device) && device.on ? (
              <span className={styles.readings}>
                <span className={styles.live}>Температура {device.level}°</span>
                <span className={styles.live}>Влажность {device.humidity}%</span>
              </span>
            ) : (
              <span className={device.on ? styles.live : undefined}>{statusText(device)}</span>
            )}
          </Link>
          <Toggle
            pressed={device.on}
            label={device.on ? `Выключить «${device.name}»` : `Включить «${device.name}»`}
            onClick={() => onToggle(device.id)}
          />
        </li>
      ))}
    </ul>
  );
}

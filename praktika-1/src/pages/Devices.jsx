import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DeviceList from "../components/DeviceList";
import { useHome } from "../context/HomeContext";
import { ROOMS, TYPES, countLine } from "../lib/home";
import styles from "./Devices.module.css";

export default function Devices() {
  const { devices, toggleDevice } = useHome();
  const [params, setParams] = useSearchParams();
  const room = params.get("room") || "all";
  const type = params.get("type") || "all";
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return devices.filter((device) => {
      const matchesRoom = room === "all" || device.room === room;
      const matchesType = type === "all" || device.type === type;
      const haystack = `${device.name} ${device.note} ${ROOMS[device.room]} ${TYPES[device.type]}`.toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesRoom && matchesType && matchesQuery;
    });
  }, [devices, room, type, query]);

  function setFilter(key, next) {
    const nextParams = {};
    const other = key === "room" ? "type" : "room";
    const otherValue = params.get(other);
    if (otherValue) nextParams[other] = otherValue;
    if (next !== "all") nextParams[key] = next;
    setParams(nextParams);
  }

  const heading = room !== "all" ? ROOMS[room] : type !== "all" ? TYPES[type] : "Устройства";
  const counted = visible.filter((device) => (type === "lock" ? true : device.type !== "lock"));
  const on = counted.filter((device) => device.on).length;
  const word = type === "lock" ? "закрыто" : "включено";

  return (
    <div className={`page ${styles.page}`}>
      <header className={styles.intro}>
        <h1>{heading}</h1>
        {devices.length > 0 && <p>{countLine(on, counted.length, word)}</p>}
      </header>

      <label className={styles.search}>
        <span className="sr-only">Поиск устройств</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию и заметке"
        />
      </label>

      <div className={styles.filters}>
        <label className={styles.field}>
          Комната
          <select value={room} onChange={(event) => setFilter("room", event.target.value)}>
            <option value="all">Все комнаты</option>
            {Object.entries(ROOMS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Тип
          <select value={type} onChange={(event) => setFilter("type", event.target.value)}>
            <option value="all">Все типы</option>
            {Object.entries(TYPES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {devices.length === 0 && (
        <div className={styles.empty}>
          <h2>В квартире пусто</h2>
          <p>Добавьте первое устройство — оно сохранится в этом браузере.</p>
        </div>
      )}

      {devices.length > 0 && visible.length === 0 && (
        <div className={styles.empty}>
          <h2>Ничего не найдено</h2>
          <p>Смените комнату, тип или очистите поиск.</p>
        </div>
      )}

      <DeviceList devices={visible} onToggle={toggleDevice} />

      <Link to="/devices/new" className={styles.add} aria-label="Добавить устройство">
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <path d="M11 3v16M3 11h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}

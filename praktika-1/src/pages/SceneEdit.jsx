import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Toggle from "../components/Toggle";
import { useHome } from "../context/HomeContext";
import { ROOMS, TYPES, defaultLevel, hasLevel, isSensor, levelRange, statusText } from "../lib/home";
import styles from "./SceneEdit.module.css";

function includedFrom(scene) {
  if (!scene) return {};
  return Object.fromEntries(
    Object.entries(scene.patch).map(([id, patch]) => [id, { on: Boolean(patch.on), level: patch.level ?? 0 }]),
  );
}

export default function SceneEdit() {
  const { id } = useParams();
  return <SceneEditor key={id ?? "new"} />;
}

function SceneEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devices, scenes, addScene, updateScene, deleteScene } = useHome();
  const existing = id ? scenes.find((scene) => scene.id === id) : null;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [text, setText] = useState(existing?.text ?? "");
  const [included, setIncluded] = useState(() => includedFrom(existing));
  const [errors, setErrors] = useState({});

  if (id && !existing) {
    return (
      <div className={styles.missing}>
        <h2>Такого сценария нет</h2>
        <p>Он мог быть удалён в этом браузере.</p>
        <Link to="/scenes" className="btn btn-primary">
          К сценариям
        </Link>
      </div>
    );
  }

  const controllable = devices.filter((device) => !isSensor(device));
  const chosen = controllable.filter((device) => included[device.id]);
  const unusedByType = Object.entries(TYPES)
    .map(([type, label]) => ({
      type,
      label,
      devices: controllable.filter((device) => device.type === type && !included[device.id]),
    }))
    .filter((group) => group.devices.length > 0);

  function clearError(name) {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function toggleInclude(device) {
    setIncluded((prev) => {
      if (prev[device.id]) {
        const next = { ...prev };
        delete next[device.id];
        return next;
      }
      return {
        ...prev,
        [device.id]: {
          on: device.type === "curtain" ? device.level > 0 : device.on,
          level: hasLevel(device.type) ? device.level : 0,
        },
      };
    });
    clearError("devices");
  }

  function setOn(device, on) {
    setIncluded((prev) => {
      const current = prev[device.id];
      if (!current) return prev;
      let level = current.level;
      if (device.type === "curtain" && on && level === 0) level = defaultLevel("curtain");
      if (device.type === "curtain" && !on) level = 0;
      return { ...prev, [device.id]: { on, level } };
    });
  }

  function setDeviceLevel(device, level) {
    setIncluded((prev) => {
      const current = prev[device.id];
      if (!current) return prev;
      const on = device.type === "curtain" ? level > 0 : current.on;
      return { ...prev, [device.id]: { on, level } };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    const nextTitle = title.trim();
    const nextText = text.trim();
    if (!nextTitle) nextErrors.title = "Введите название";
    else if (nextTitle.length < 3) nextErrors.title = "Минимум 3 символа";
    else if (nextTitle.length > 40) nextErrors.title = "Не больше 40 символов";
    if (!nextText) nextErrors.text = "Опишите, что делает сценарий";
    else if (nextText.length < 10) nextErrors.text = "Минимум 10 символов";
    else if (nextText.length > 240) nextErrors.text = "Не больше 240 символов";
    if (Object.keys(included).length === 0) nextErrors.devices = "Отметьте хотя бы одно устройство";
    setErrors(nextErrors);
    const fields = Object.keys(nextErrors);
    if (fields.length > 0) {
      document.getElementById(fields[0])?.focus();
      return;
    }

    const patch = {};
    for (const [deviceId, value] of Object.entries(included)) {
      const device = controllable.find((item) => item.id === deviceId);
      if (!device) continue;
      const entry = { on: value.on };
      if (hasLevel(device.type)) entry.level = value.level;
      patch[deviceId] = entry;
    }

    const data = { title: nextTitle, text: nextText, patch };
    if (existing) {
      updateScene(existing.id, data);
      navigate("/scenes");
      return;
    }
    addScene(data);
    navigate("/scenes");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field} htmlFor="title">
        Название
        <input
          id="title"
          value={title}
          maxLength={40}
          aria-invalid={Boolean(errors.title)}
          onChange={(event) => {
            setTitle(event.target.value);
            clearError("title");
          }}
          placeholder="Например, Гости"
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </label>

      <label className={styles.field} htmlFor="text">
        Описание
        <textarea
          id="text"
          rows={3}
          value={text}
          maxLength={240}
          aria-invalid={Boolean(errors.text)}
          onChange={(event) => {
            setText(event.target.value);
            clearError("text");
          }}
          placeholder="Что меняется в доме"
        />
        <span className={errors.text ? styles.error : styles.hint}>
          {errors.text ?? `Минимум 10 символов. Сейчас ${text.trim().length}.`}
        </span>
      </label>

      <fieldset className={styles.devices} id="devices" tabIndex={-1}>
        <legend>Устройства</legend>
        <p className={styles.hint}>Сценарий меняет только устройства из списка. Остальные спрятаны в списках по типу.</p>
        {controllable.length === 0 && <p className={styles.hint}>Сначала добавьте устройство, которым сценарий может управлять.</p>}
        {chosen.length > 0 && (
          <ul>
            {chosen.map((device) => {
              const value = included[device.id];
              const range = hasLevel(device.type) ? levelRange(device.type) : null;
              return (
                <li key={device.id}>
                  <label className={styles.pickOn}>
                    <input type="checkbox" checked onChange={() => toggleInclude(device)} />
                    <span>
                      <b>{device.name}</b>
                      <small>
                        {ROOMS[device.room]} · {TYPES[device.type]}
                      </small>
                    </span>
                  </label>
                  <div className={styles.controls}>
                    <span>{statusText({ ...device, on: value.on, level: value.level })}</span>
                    <Toggle
                      pressed={value.on}
                      label={value.on ? `Выключить «${device.name}» в сценарии` : `Включить «${device.name}» в сценарии`}
                      onClick={() => setOn(device, !value.on)}
                    />
                    {range && (
                      <label className={styles.level}>
                        {range.label}
                        <input
                          type="range"
                          min={range.min}
                          max={range.max}
                          value={value.level}
                          onChange={(event) => setDeviceLevel(device, Number(event.target.value))}
                        />
                      </label>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {unusedByType.length > 0 && (
          <div className={styles.spare}>
            {unusedByType.map((group) => (
              <label key={group.type} className={styles.spareField}>
                {group.label}
                <select
                  value=""
                  aria-label={`Неиспользуемые: ${group.label}`}
                  onChange={(event) => {
                    const device = group.devices.find((item) => item.id === event.target.value);
                    if (device) toggleInclude(device);
                  }}
                >
                  <option value="">Не используется</option>
                  {group.devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        {errors.devices && <p className={styles.error}>{errors.devices}</p>}
      </fieldset>

      <button type="submit" className="btn btn-primary">
        {existing ? "Сохранить" : "Добавить сценарий"}
      </button>

      {existing && (
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            deleteScene(existing.id);
            navigate("/scenes");
          }}
        >
          Удалить сценарий
        </button>
      )}
    </form>
  );
}

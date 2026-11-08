import { useState } from "react";
import { ROOMS, TYPES, defaultLevel, formatLevel, hasLevel, isSensor, levelRange } from "../lib/home";
import styles from "./DeviceForm.module.css";

const EMPTY = {
  name: "",
  note: "",
  room: "living",
  type: "light",
  on: true,
  level: defaultLevel("light"),
};

function validate(values) {
  const errors = {};
  const name = values.name.trim();
  const note = values.note.trim();

  if (!name) errors.name = "Введите название";
  else if (name.length < 3) errors.name = "Минимум 3 символа";
  else if (name.length > 40) errors.name = "Не больше 40 символов";

  if (!note) errors.note = "Добавьте, где стоит устройство и зачем оно";
  else if (note.length < 10) errors.note = "Минимум 10 символов";
  else if (note.length > 240) errors.note = "Не больше 240 символов";

  if (!ROOMS[values.room]) errors.room = "Выберите комнату";
  if (!TYPES[values.type]) errors.type = "Выберите тип";

  const range = levelRange(values.type);
  if (range && (values.level < range.min || values.level > range.max)) {
    errors.level = `От ${range.min} до ${range.max}`;
  }

  return errors;
}

function ChoiceGroup({ legend, name, value, options, error, onChange }) {
  return (
    <fieldset className={styles.fieldset} id={name}>
      <legend>{legend}</legend>
      <div className={styles.choices}>
        {options.map((option) => (
          <label key={option.value} className={value === option.value ? styles.choiceOn : styles.choice}>
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </fieldset>
  );
}

export default function DeviceForm({ initial, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initial ?? EMPTY);
  const [errors, setErrors] = useState({});
  const sensor = values.type === "climate" && isSensor(values);
  const range = sensor ? null : levelRange(values.type);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setValues((prev) => {
      if (name === "on") return { ...prev, on: checked };
      if (name === "type") {
        const next = { ...prev, type: value, level: defaultLevel(value) };
        if (value !== "climate") delete next.humidity;
        return next;
      }
      if (name === "level") return { ...prev, level: Number(value) };
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const fields = Object.keys(nextErrors);
    if (fields.length > 0) {
      document.getElementById(fields[0])?.focus();
      return;
    }

    const sensor = values.type === "climate" && isSensor(values);
    onSubmit({
      name: values.name.trim(),
      note: values.note.trim(),
      room: values.room,
      type: values.type,
      on: sensor ? true : values.on,
      level: sensor ? values.level : hasLevel(values.type) ? Number(values.level) : 0,
      ...(sensor ? { humidity: values.humidity } : {}),
    });
  }

  const switchLabel = values.type === "lock" ? "Сразу закрыть" : "Сразу включить";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field} htmlFor="name">
        Название
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={update}
          maxLength={40}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          placeholder="Например, бра у кровати"
        />
        {errors.name && (
          <span id="name-error" className={styles.error}>
            {errors.name}
          </span>
        )}
      </label>

      <label className={styles.field} htmlFor="note">
        Заметка
        <textarea
          id="note"
          name="note"
          rows={4}
          value={values.note}
          onChange={update}
          maxLength={240}
          aria-invalid={Boolean(errors.note)}
          aria-describedby="note-hint"
          placeholder="Где стоит устройство и что оно делает"
        />
        <span id="note-hint" className={errors.note ? styles.error : styles.hint}>
          {errors.note ?? `Минимум 10 символов. Сейчас ${values.note.trim().length}.`}
        </span>
      </label>

      <ChoiceGroup
        legend="Комната"
        name="room"
        value={values.room}
        options={Object.entries(ROOMS).map(([value, label]) => ({ value, label }))}
        error={errors.room}
        onChange={update}
      />

      <ChoiceGroup
        legend="Тип"
        name="type"
        value={values.type}
        options={Object.entries(TYPES).map(([value, label]) => ({ value, label }))}
        error={errors.type}
        onChange={update}
      />

      {sensor && (
        <p className={styles.hint}>
          Показания датчика не задаются вручную: {values.level}° и влажность {values.humidity}%.
        </p>
      )}

      {range && (
        <label className={styles.field} htmlFor="level">
          {range.label}
          <input
            id="level"
            name="level"
            type="range"
            min={range.min}
            max={range.max}
            value={values.level}
            onChange={update}
          />
          <span className={styles.hint}>{formatLevel(values.type, values.level)}</span>
          {errors.level && <span className={styles.error}>{errors.level}</span>}
        </label>
      )}

      {!sensor && (
        <label className={styles.check}>
          <input type="checkbox" name="on" checked={values.on} onChange={update} />
          {switchLabel}
        </label>
      )}

      <div>
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

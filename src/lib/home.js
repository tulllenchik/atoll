export const ROOMS = {
  living: "Гостиная",
  bedroom: "Спальня",
  kitchen: "Кухня",
  hall: "Прихожая",
};

export const TYPES = {
  light: "Свет",
  climate: "Климат",
  plug: "Розетка",
  curtain: "Шторы",
  lock: "Замок",
};

export const SCENES = [
  {
    id: "evening",
    title: "Вечер",
    text: "Тёплый свет у дивана, шторы почти закрыты, кухня только для ориентира.",
    patch: {
      "lamp-floor": { on: true, level: 48 },
      "lamp-main": { on: false },
      curtains: { on: true, level: 12 },
      "kitchen-light": { on: true, level: 28 },
      "bed-light": { on: true, level: 22 },
      kettle: { on: false },
    },
  },
  {
    id: "morning",
    title: "Утро",
    text: "Шторы открываются, кухня и прихожая загораются, люстра включается.",
    patch: {
      curtains: { on: true, level: 100 },
      "kitchen-light": { on: true, level: 100 },
      "hall-light": { on: true, level: 80 },
      "lamp-main": { on: true, level: 75 },
      "lamp-floor": { on: false },
      ac: { on: true, level: 22 },
    },
  },
  {
    id: "cinema",
    title: "Кино",
    text: "Люстра гаснет, торшер едва тёплый, шторы закрыты полностью.",
    patch: {
      "lamp-main": { on: false },
      "lamp-floor": { on: true, level: 12 },
      curtains: { on: false, level: 0 },
      "kitchen-light": { on: false },
      "hall-light": { on: false },
    },
  },
  {
    id: "away",
    title: "Никого нет",
    text: "Свет и розетки выключаются, шторы закрываются, замок остаётся закрытым.",
    patch: {
      "lamp-floor": { on: false },
      "lamp-main": { on: false },
      "bed-light": { on: false },
      "kitchen-light": { on: false },
      "hall-light": { on: false },
      kettle: { on: false },
      ac: { on: false },
      curtains: { on: false, level: 0 },
        lock: { on: true, locked: true },
    },
  },
];

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5 || hour >= 23) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 17) return "Добрый день";
  return "Добрый вечер";
}

export const LOCK_MODES = [
  { id: "closed", label: "Закрыт" },
  { id: "open", label: "Открыт" },
  { id: "off", label: "Отключен" },
];

export function isSensor(device) {
  return typeof device?.humidity === "number";
}

export function lockMode(device) {
  if (!device?.on) return "off";
  return device.locked === false ? "open" : "closed";
}

export function lockPatch(mode) {
  if (mode === "off") return { on: false };
  if (mode === "open") return { on: true, locked: false };
  return { on: true, locked: true };
}

export function withLockBolt(devices) {
  return devices.map((device) => {
    if (device.type !== "lock" || typeof device.locked === "boolean") return device;
    if (device.on) return { ...device, locked: true };
    return { ...device, on: true, locked: false };
  });
}

export function lockNeedsAttention(device) {
  return device.type === "lock" && (!device.on || device.locked === false);
}

export function hasLevel(type) {
  return type === "light" || type === "climate" || type === "curtain";
}

export function levelRange(type) {
  if (type === "climate") return { min: 16, max: 28, label: "Температура" };
  if (type === "light") return { min: 1, max: 100, label: "Яркость" };
  if (type === "curtain") return { min: 0, max: 100, label: "Насколько открыты" };
  return null;
}

export function defaultLevel(type) {
  if (type === "climate") return 22;
  if (type === "light") return 60;
  if (type === "curtain") return 40;
  return 0;
}

export function formatLevel(type, level) {
  if (type === "climate") return `${level}°`;
  if (type === "light" || type === "curtain") return `${level}%`;
  return "";
}

export function statusText(device) {
  if (isSensor(device)) {
    if (!device.on) return "Выключен";
    return `Температура ${device.level}° · Влажность ${device.humidity}%`;
  }
  if (device.type === "lock") {
    if (!device.on) return "Отключен";
    return device.locked === false ? "Открыт" : "Закрыт";
  }
  if (device.type === "plug") return device.on ? "Питание есть" : "Без питания";
  if (device.type === "curtain") {
    if (!device.on || device.level === 0) return "Закрыты";
    return `Открыты на ${device.level}%`;
  }
  if (device.type === "climate") return device.on ? `Температура ${device.level}°` : "Выключен";
  return device.on ? `Яркость ${device.level}%` : "Выключен";
}

const WEEKDAYS = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function formatDay(date = new Date()) {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function countLine(on, total, word = "включено") {
  if (total === 0) return "Нет устройств";
  return `${on} из ${total} ${word}`;
}

export function pageTitle(pathname) {
  if (pathname === "/") return "Дом";
  if (pathname === "/devices") return "Устройства";
  if (pathname === "/devices/new") return "Новое устройство";
  if (/^\/devices\/[^/]+\/edit$/.test(pathname)) return "Редактирование";
  if (/^\/devices\/[^/]+$/.test(pathname)) return "Карточка устройства";
  if (pathname === "/scenes") return "Сценарии";
  if (pathname === "/scenes/new") return "Новый сценарий";
  if (/^\/scenes\/[^/]+\/edit$/.test(pathname)) return "Редактирование сценария";
  return "Атолл";
}

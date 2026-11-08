import { createContext, useContext, useEffect, useState } from "react";
import { SCENES } from "../lib/home";

const STORAGE_KEY = "atrium-home";
const MIGRATION_KEY = "atrium-home-migration";

const SEED_DEVICES = [
  {
    id: "lamp-floor",
    name: "Торшер",
    room: "living",
    type: "light",
    note: "Стоит у дивана и даёт тёплый свет для вечера.",
    on: true,
    level: 62,
  },
  {
    id: "lamp-main",
    name: "Люстра",
    room: "living",
    type: "light",
    note: "Основной свет гостиной, четыре лампы над столом.",
    on: false,
    level: 80,
  },
  {
    id: "curtains",
    name: "Шторы",
    room: "living",
    type: "curtain",
    note: "Плотные шторы на окно во двор. Ноль — полностью закрыты.",
    on: true,
    level: 20,
  },
  {
    id: "ac",
    name: "Кондиционер",
    room: "bedroom",
    type: "climate",
    note: "Держит температуру в спальне, когда дома кто-то есть.",
    on: true,
    level: 22,
  },
  {
    id: "climate-sensor",
    name: "Датчик климата",
    room: "living",
    type: "climate",
    note: "Стоит в гостиной и показывает температуру и влажность. Показания только считываются.",
    on: true,
    level: 23,
    humidity: 46,
  },
  {
    id: "bed-light",
    name: "Бра",
    room: "bedroom",
    type: "light",
    note: "Два бра по сторонам кровати, свет не бьёт в глаза.",
    on: false,
    level: 35,
  },
  {
    id: "kitchen-light",
    name: "Свет кухни",
    room: "kitchen",
    type: "light",
    note: "Линейный свет над столешницей и плитой.",
    on: true,
    level: 90,
  },
  {
    id: "kettle",
    name: "Розетка у стола",
    room: "kitchen",
    type: "plug",
    note: "Чайник и ночник. Выключается сценарием «Никого нет».",
    on: false,
    level: 0,
  },
  {
    id: "hall-light",
    name: "Свет в прихожей",
    room: "hall",
    type: "light",
    note: "Подсветка у двери и зеркала.",
    on: false,
    level: 70,
  },
  {
    id: "lock",
    name: "Входной замок",
    room: "hall",
    type: "lock",
    note: "Электронный замок входной двери. Включённое состояние — закрыт.",
    on: true,
    level: 0,
  },
];

const HomeContext = createContext(null);

function withClimateSensor(devices) {
  if (localStorage.getItem(MIGRATION_KEY) === "1") return devices;
  localStorage.setItem(MIGRATION_KEY, "1");
  if (devices.some((device) => device.id === "climate-sensor")) return devices;
  const sensor = SEED_DEVICES.find((device) => device.id === "climate-sensor");
  return [...devices, sensor];
}

function freshState() {
  return { devices: withClimateSensor(SEED_DEVICES), scenes: SCENES, sceneId: null };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.devices)) return freshState();
    return {
      devices: withClimateSensor(parsed.devices),
      scenes: Array.isArray(parsed.scenes) ? parsed.scenes : SCENES,
      sceneId: parsed.sceneId ?? null,
    };
  } catch {
    return freshState();
  }
}

export function HomeProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function addDevice(data) {
    const device = { id: crypto.randomUUID(), ...data };
    setState((prev) => ({ ...prev, sceneId: null, devices: [device, ...prev.devices] }));
    return device;
  }

  function updateDevice(id, data) {
    setState((prev) => ({
      ...prev,
      sceneId: null,
      devices: prev.devices.map((device) => {
        if (device.id !== id) return device;
        const next = { ...device, ...data };
        if (data.humidity == null) delete next.humidity;
        return next;
      }),
    }));
  }

  function deleteDevice(id) {
    setState((prev) => ({
      ...prev,
      sceneId: null,
      devices: prev.devices.filter((device) => device.id !== id),
    }));
  }

  function toggleDevice(id) {
    setState((prev) => ({
      ...prev,
      sceneId: null,
      devices: prev.devices.map((device) => (device.id === id ? { ...device, on: !device.on } : device)),
    }));
  }

  function setLevel(id, level) {
    setState((prev) => ({
      ...prev,
      sceneId: null,
      devices: prev.devices.map((device) => {
        if (device.id !== id) return device;
        const next = { ...device, level };
        if (device.type === "curtain") next.on = level > 0;
        return next;
      }),
    }));
  }

  function applyScene(sceneId) {
    setState((prev) => {
      const scene = (prev.scenes ?? SCENES).find((item) => item.id === sceneId);
      if (!scene) return prev;
      return {
        ...prev,
        sceneId,
        devices: prev.devices.map((device) => {
          const patch = scene.patch[device.id];
          return patch ? { ...device, ...patch } : device;
        }),
      };
    });
  }

  function addScene(data) {
    const scene = { id: crypto.randomUUID(), ...data };
    setState((prev) => ({ ...prev, scenes: [...(prev.scenes ?? SCENES), scene] }));
    return scene;
  }

  function updateScene(id, data) {
    setState((prev) => ({
      ...prev,
      scenes: (prev.scenes ?? SCENES).map((scene) => (scene.id === id ? { ...scene, ...data } : scene)),
    }));
  }

  function deleteScene(id) {
    setState((prev) => ({
      ...prev,
      sceneId: prev.sceneId === id ? null : prev.sceneId,
      scenes: (prev.scenes ?? SCENES).filter((scene) => scene.id !== id),
    }));
  }

  const value = {
    devices: state.devices,
    scenes: state.scenes ?? SCENES,
    sceneId: state.sceneId,
    addDevice,
    updateDevice,
    deleteDevice,
    toggleDevice,
    setLevel,
    applyScene,
    addScene,
    updateScene,
    deleteScene,
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) throw new Error("useHome нужно вызывать внутри HomeProvider");
  return context;
}

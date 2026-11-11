import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { applyWeather, demoMode, fetchHome, fetchWeather } from "../lib/api";
import { lockPatch, SCENES, withLockBolt } from "../lib/home";

const STORAGE_KEY = "atoll-home-v2";

const HomeContext = createContext(null);

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.devices)) return null;
    return {
      devices: withLockBolt(parsed.devices),
      scenes: Array.isArray(parsed.scenes) ? parsed.scenes : SCENES,
      sceneId: parsed.sceneId ?? null,
    };
  } catch {
    return null;
  }
}

export function HomeProvider({ children }) {
  const [state, setState] = useState({ devices: [], scenes: [], sceneId: null });
  const [status, setStatus] = useState("loading");
  const [weather, setWeather] = useState(null);

  const persist = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    if (status === "success" || status === "empty") persist(state);
  }, [state, status, persist]);

  const load = useCallback(async () => {
    setStatus("loading");
    const demo = demoMode();

    if (demo === "error") {
      setWeather(null);
      setState({ devices: [], scenes: [], sceneId: null });
      setStatus("error");
      return;
    }

    try {
      const home = demo === "empty" ? { devices: [], scenes: [] } : await fetchHome();
      let nextWeather = null;
      try {
        nextWeather = await fetchWeather();
      } catch {
        nextWeather = null;
      }

      const cached = demo === "empty" ? null : readCache();
      let devices = cached?.devices ?? home.devices;
      const scenes = cached?.scenes ?? home.scenes;
      const sceneId = cached?.sceneId ?? null;
        devices = applyWeather(withLockBolt(devices), nextWeather);

      setWeather(nextWeather);
      setState({ devices, scenes, sceneId });
      setStatus(devices.length === 0 ? "empty" : "success");
    } catch {
      const cached = readCache();
      if (cached) {
        setState(cached);
        setWeather(null);
        setStatus(cached.devices.length === 0 ? "empty" : "success");
        return;
      }
      setWeather(null);
      setState({ devices: [], scenes: [], sceneId: null });
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (status === "loading" || status === "error") return;
    const next = state.devices.length === 0 ? "empty" : "success";
    if (next !== status) setStatus(next);
  }, [state.devices.length, status]);

  function addDevice(data) {
    const device = { id: crypto.randomUUID(), ...data };
    setState((prev) => ({ ...prev, sceneId: null, devices: [device, ...prev.devices] }));
    setStatus("success");
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
        if (next.type !== "lock") delete next.locked;
        return next;
      }),
    }));
  }

  function deleteDevice(id) {
    setState((prev) => {
      const devices = prev.devices.filter((device) => device.id !== id);
      return { ...prev, sceneId: null, devices };
    });
  }

  function toggleDevice(id) {
    setState((prev) => ({
      ...prev,
      sceneId: null,
      devices: prev.devices.map((device) => {
        if (device.id !== id) return device;
        if (device.type === "lock") {
          if (device.on) return { ...device, on: false };
          return { ...device, on: true, locked: device.locked !== false };
        }
        return { ...device, on: !device.on };
      }),
    }));
  }

  function setLockMode(id, mode) {
    setState((prev) => ({
      ...prev,
      sceneId: null,
      devices: prev.devices.map((device) => (device.id === id ? { ...device, ...lockPatch(mode) } : device)),
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
    status,
    weather,
    reload: load,
    addDevice,
    updateDevice,
    deleteDevice,
    toggleDevice,
    setLockMode,
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

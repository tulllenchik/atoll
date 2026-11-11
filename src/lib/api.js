export const HOME_API = `${import.meta.env.BASE_URL}api/home.json`;

export const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast?latitude=55.6697&longitude=37.4805&current=temperature_2m,relative_humidity_2m&timezone=Europe%2FMoscow";

export async function fetchJson(url, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("Запрос превысил время ожидания");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function normalizeHome(data) {
  if (!data || !Array.isArray(data.devices) || !Array.isArray(data.scenes)) {
    throw new Error("Каталог квартиры пришёл в неверном виде");
  }
  return {
    address: typeof data.address === "string" ? data.address : "Проспект Вернадского, 78, Москва",
    devices: data.devices,
    scenes: data.scenes,
  };
}

export function normalizeWeather(data) {
  const temperature = data?.current?.temperature_2m;
  const humidity = data?.current?.relative_humidity_2m;
  if (typeof temperature !== "number" || typeof humidity !== "number") {
    throw new Error("Прогноз пришёл без температуры или влажности");
  }
  return {
    temperature: Math.round(temperature),
    humidity: Math.round(humidity),
    time: data.current.time ?? null,
  };
}

export function applyWeather(devices, weather) {
  if (!weather) return devices;
  return devices.map((device) => {
    if (device.id !== "climate-sensor") return device;
    return {
      ...device,
      on: true,
      level: weather.temperature,
      humidity: weather.humidity,
    };
  });
}

export function demoMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("demo");
}

export async function fetchHome() {
  return normalizeHome(await fetchJson(HOME_API));
}

export async function fetchWeather() {
  return normalizeWeather(await fetchJson(WEATHER_API));
}

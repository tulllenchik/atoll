import { Outlet, useLocation } from "react-router-dom";
import { useHome } from "../context/HomeContext";
import { pageTitle } from "../lib/home";
import Header, { Tabs } from "./Header";
import Main from "./Main";
import StatusScreen from "./StatusScreen";
import "../App.css";

export default function Layout() {
  const { pathname } = useLocation();
  const { devices, scenes, status, reload } = useHome();
  const detailId = pathname.match(/^\/devices\/([^/]+)$/)?.[1];
  const device = detailId ? devices.find((item) => item.id === detailId) : null;
  const sceneEditId = pathname.match(/^\/scenes\/([^/]+)\/edit$/)?.[1];
  const scene = sceneEditId ? scenes.find((item) => item.id === sceneEditId) : null;
  const ownHeading = pathname === "/" || pathname === "/devices" || pathname === "/scenes" || Boolean(device);
  const blocked = status === "loading" || status === "error";

  return (
    <div className="shell">
      <Header
        title={ownHeading || blocked ? null : pageTitle(pathname)}
        documentTitle={blocked ? "Атолл" : device ? device.name : scene ? scene.title : pageTitle(pathname)}
      />
      <Main>
        {status === "loading" && <StatusScreen kind="loading" />}
        {status === "error" && <StatusScreen kind="error" onRetry={reload} />}
        {status !== "loading" && status !== "error" && <Outlet />}
      </Main>
      <Tabs />
    </div>
  );
}

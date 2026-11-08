import { Outlet, useLocation } from "react-router-dom";
import { useHome } from "../context/HomeContext";
import { pageTitle } from "../lib/home";
import Header, { Tabs } from "./Header";
import Main from "./Main";
import "../App.css";

export default function Layout() {
  const { pathname } = useLocation();
  const { devices, scenes } = useHome();
  const detailId = pathname.match(/^\/devices\/([^/]+)$/)?.[1];
  const device = detailId ? devices.find((item) => item.id === detailId) : null;
  const sceneEditId = pathname.match(/^\/scenes\/([^/]+)\/edit$/)?.[1];
  const scene = sceneEditId ? scenes.find((item) => item.id === sceneEditId) : null;
  const ownHeading = pathname === "/" || pathname === "/devices" || pathname === "/scenes" || Boolean(device);

  return (
    <div className="shell">
      <Header
        title={ownHeading ? null : pageTitle(pathname)}
        documentTitle={device ? device.name : scene ? scene.title : pageTitle(pathname)}
      />
      <Main>
        <Outlet />
      </Main>
      <Tabs />
    </div>
  );
}

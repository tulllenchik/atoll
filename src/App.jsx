import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { HomeProvider } from "./context/HomeContext";
import DeviceDetail from "./pages/DeviceDetail";
import DeviceEdit from "./pages/DeviceEdit";
import Devices from "./pages/Devices";
import Home from "./pages/Home";
import SceneEdit from "./pages/SceneEdit";
import Scenes from "./pages/Scenes";

export default function App() {
  return (
    <HomeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="devices" element={<Devices />} />
            <Route path="devices/new" element={<DeviceEdit />} />
            <Route path="devices/:id" element={<DeviceDetail />} />
            <Route path="devices/:id/edit" element={<DeviceEdit />} />
            <Route path="scenes/new" element={<SceneEdit />} />
            <Route path="scenes/:id/edit" element={<SceneEdit />} />
            <Route path="scenes" element={<Scenes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HomeProvider>
  );
}

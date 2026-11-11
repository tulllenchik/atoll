import { Link, useNavigate, useParams } from "react-router-dom";
import DeviceForm from "../components/DeviceForm";
import { useHome } from "../context/HomeContext";
import styles from "./DeviceEdit.module.css";

export default function DeviceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { devices, addDevice, updateDevice } = useHome();
  const existing = id ? devices.find((device) => device.id === id) : null;

  if (id && !existing) {
    return (
      <div className={styles.missing}>
        <h2>Редактировать нечего</h2>
        <p>Устройство с таким адресом не найдено.</p>
        <Link to="/devices" className="btn btn-primary">
          К устройствам
        </Link>
      </div>
    );
  }

  function handleSubmit(data) {
    if (existing) {
      updateDevice(existing.id, data);
      navigate(`/devices/${existing.id}`);
      return;
    }
    const created = addDevice(data);
    navigate(`/devices/${created.id}`);
  }

  return (
    <div className={styles.layout}>
      <DeviceForm
        initial={
          existing
            ? {
                name: existing.name,
                note: existing.note,
                room: existing.room,
                type: existing.type,
                on: existing.on,
                locked: existing.locked,
                level: existing.level,
                humidity: existing.humidity,
              }
            : undefined
        }
        submitLabel={existing ? "Сохранить" : "Добавить устройство"}
        onSubmit={handleSubmit}
      />
      <aside className={styles.aside}>
        <h2>{existing ? "Что изменится" : "Как заполнить"}</h2>
        <p>
          Название — от 3 символов, заметка — от 10. Комната и тип обязательны. У света, климата и штор можно задать
          уровень сразу.
        </p>
        <p>У замка три состояния: закрыт, открыт и отключен. Розетка подаёт или снимает питание.</p>
        <Link to={existing ? `/devices/${existing.id}` : "/devices"} className="btn btn-ghost">
          Отмена
        </Link>
      </aside>
    </div>
  );
}

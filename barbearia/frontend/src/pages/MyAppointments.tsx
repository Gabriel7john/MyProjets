import { useEffect, useState } from "react";
import { formatPrice } from "../components/ServiceCard";
import { api } from "../lib/api";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELED" | "COMPLETED" | "NO_SHOW";
  service: { name: string; priceCents: number };
}

const STATUS_LABEL: Record<Appointment["status"], string> = {
  CONFIRMED: "Confirmado",
  CANCELED: "Cancelado",
  COMPLETED: "Concluído",
  NO_SHOW: "Não compareceu",
};

export function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get<Appointment[]>("/appointments/me")
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCancel(id: string) {
    await api.patch(`/appointments/${id}/cancel`);
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-bone-100">Meus horários</h1>

      {loading ? (
        <p className="mt-6 font-mono text-sm text-bone-200/50">Carregando...</p>
      ) : appointments.length === 0 ? (
        <p className="mt-6 font-mono text-sm text-bone-200/50">
          Você ainda não tem agendamentos. Marque o primeiro na página inicial.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between rounded-sm border border-charcoal-700 bg-charcoal-900 px-5 py-4"
            >
              <div>
                <p className="font-display text-lg text-bone-100">{appt.service.name}</p>
                <p className="font-mono text-xs text-bone-200/50">
                  {appt.date.split("T")[0].split("-").reverse().join("/")} às {appt.startTime} ·{" "}
                  {formatPrice(appt.service.priceCents)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-xs uppercase tracking-wider ${
                    appt.status === "CONFIRMED" ? "text-brass-400" : "text-bone-200/40"
                  }`}
                >
                  {STATUS_LABEL[appt.status]}
                </span>
                {appt.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="rounded-sm border border-charcoal-700 px-3 py-1.5 font-mono text-xs text-bone-200/70 transition hover:border-barber-red hover:text-barber-red"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DateStrip } from "../components/DateStrip";
import { formatPrice } from "../components/ServiceCard";
import { api } from "../lib/api";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELED" | "COMPLETED" | "NO_SHOW";
  service: { name: string; priceCents: number };
  client: { name: string; phone: string | null; email: string };
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get<Appointment[]>("/appointments", { params: { date: selectedDate } })
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [selectedDate]);

  async function updateStatus(id: string, status: Appointment["status"]) {
    await api.patch(`/appointments/${id}/status`, { status });
    load();
  }

  const activeAppointments = appointments.filter((a) => a.status !== "CANCELED");
  const dayRevenue = activeAppointments
    .filter((a) => a.status !== "NO_SHOW")
    .reduce((sum, a) => sum + a.service.priceCents, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-bone-100">Agenda</h1>
          <p className="mt-1 font-body text-sm text-bone-200/60">
            Acompanhe os horários marcados pra cada dia.
          </p>
        </div>
        <Link
          to="/admin/configuracoes"
          className="rounded-sm border border-charcoal-700 px-3 py-1.5 font-mono text-xs text-bone-200/70 transition hover:border-brass-400 hover:text-brass-400"
        >
          Configurações
        </Link>
      </div>

      <div className="mt-8">
        <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
      </div>

      <div className="mt-4 flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-bone-200/50">
        <span>{activeAppointments.length} agendamento(s)</span>
        <span className="text-brass-400">{formatPrice(dayRevenue)} previsto</span>
      </div>

      {loading ? (
        <p className="mt-8 font-mono text-sm text-bone-200/50">Carregando...</p>
      ) : appointments.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-bone-200/50">Nenhum agendamento nesse dia.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex flex-col gap-3 rounded-sm border border-charcoal-700 bg-charcoal-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-sm text-brass-400">{appt.startTime}</p>
                <p className="font-display text-lg text-bone-100">{appt.client.name}</p>
                <p className="font-body text-sm text-bone-200/60">
                  {appt.service.name}
                  {appt.client.phone ? ` · ${appt.client.phone}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {appt.status === "CONFIRMED" ? (
                  <>
                    <button
                      onClick={() => updateStatus(appt.id, "COMPLETED")}
                      className="rounded-sm border border-charcoal-700 px-3 py-1.5 font-mono text-xs text-bone-200/70 transition hover:border-brass-400 hover:text-brass-400"
                    >
                      Concluído
                    </button>
                    <button
                      onClick={() => updateStatus(appt.id, "NO_SHOW")}
                      className="rounded-sm border border-charcoal-700 px-3 py-1.5 font-mono text-xs text-bone-200/70 transition hover:border-barber-red hover:text-barber-red"
                    >
                      Faltou
                    </button>
                    <button
                      onClick={() => updateStatus(appt.id, "CANCELED")}
                      className="rounded-sm border border-charcoal-700 px-3 py-1.5 font-mono text-xs text-bone-200/70 transition hover:border-barber-red hover:text-barber-red"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <span className="font-mono text-xs uppercase tracking-wider text-bone-200/40">
                    {appt.status === "COMPLETED"
                      ? "Concluído"
                      : appt.status === "NO_SHOW"
                        ? "Não compareceu"
                        : "Cancelado"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

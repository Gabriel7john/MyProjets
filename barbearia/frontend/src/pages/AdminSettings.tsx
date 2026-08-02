import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../components/ServiceCard";
import { api } from "../lib/api";

interface Service {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
}

interface WorkingHour {
  weekday: number;
  startTime: string;
  endTime: string;
}

const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function AdminSettings() {
  const [services, setServices] = useState<Service[]>([]);
  const [hours, setHours] = useState<Map<number, WorkingHour>>(new Map());
  const [newService, setNewService] = useState({ name: "", durationMin: "30", priceCents: "" });
  const [savingService, setSavingService] = useState(false);

  function loadServices() {
    api.get<Service[]>("/services").then((res) => setServices(res.data));
  }

  function loadHours() {
    api.get<WorkingHour[]>("/working-hours").then((res) => {
      setHours(new Map(res.data.map((h) => [h.weekday, h])));
    });
  }

  useEffect(() => {
    loadServices();
    loadHours();
  }, []);

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    setSavingService(true);
    try {
      await api.post("/services", {
        name: newService.name,
        durationMin: Number(newService.durationMin),
        priceCents: Math.round(Number(newService.priceCents.replace(",", ".")) * 100),
      });
      setNewService({ name: "", durationMin: "30", priceCents: "" });
      loadServices();
    } finally {
      setSavingService(false);
    }
  }

  async function handleRemoveService(id: string) {
    await api.delete(`/services/${id}`);
    loadServices();
  }

  async function handleToggleDay(weekday: number, isOpen: boolean) {
    if (isOpen) {
      await api.delete(`/working-hours/${weekday}`);
    } else {
      await api.put(`/working-hours/${weekday}`, { startTime: "09:00", endTime: "19:00" });
    }
    loadHours();
  }

  async function handleHourChange(weekday: number, field: "startTime" | "endTime", value: string) {
    const current = hours.get(weekday) ?? { weekday, startTime: "09:00", endTime: "19:00" };
    const updated = { ...current, [field]: value };
    await api.put(`/working-hours/${weekday}`, {
      startTime: updated.startTime,
      endTime: updated.endTime,
    });
    loadHours();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-bone-100">Configurações</h1>
          <p className="mt-1 font-body text-sm text-bone-200/60">
            Gerencie os serviços oferecidos e o horário de funcionamento.
          </p>
        </div>
        <Link
          to="/admin"
          className="rounded-sm border border-charcoal-700 px-3 py-1.5 font-mono text-xs text-bone-200/70 transition hover:border-brass-400 hover:text-brass-400"
        >
          Ver agenda
        </Link>
      </div>

      {/* Serviços */}
      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-bone-200/50">
          Serviços
        </h2>

        <div className="mt-4 flex flex-col gap-2">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-sm border border-charcoal-700 bg-charcoal-900 px-4 py-3"
            >
              <div>
                <span className="font-body text-bone-100">{s.name}</span>
                <span className="ml-3 font-mono text-xs text-bone-200/50">
                  {s.durationMin} min · {formatPrice(s.priceCents)}
                </span>
              </div>
              <button
                onClick={() => handleRemoveService(s.id)}
                className="font-mono text-xs text-bone-200/50 transition hover:text-barber-red"
              >
                remover
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddService} className="mt-4 flex flex-wrap gap-2">
          <input
            required
            placeholder="Nome do serviço"
            value={newService.name}
            onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
            className="min-w-[180px] flex-1 rounded-sm border border-charcoal-700 bg-charcoal-900 px-3 py-2 text-sm text-bone-100 outline-none focus:border-brass-400"
          />
          <input
            required
            type="number"
            min={5}
            placeholder="Duração (min)"
            value={newService.durationMin}
            onChange={(e) => setNewService((p) => ({ ...p, durationMin: e.target.value }))}
            className="w-32 rounded-sm border border-charcoal-700 bg-charcoal-900 px-3 py-2 text-sm text-bone-100 outline-none focus:border-brass-400"
          />
          <input
            required
            placeholder="Preço (R$)"
            value={newService.priceCents}
            onChange={(e) => setNewService((p) => ({ ...p, priceCents: e.target.value }))}
            className="w-32 rounded-sm border border-charcoal-700 bg-charcoal-900 px-3 py-2 text-sm text-bone-100 outline-none focus:border-brass-400"
          />
          <button
            type="submit"
            disabled={savingService}
            className="rounded-sm bg-brass-500 px-4 py-2 text-sm font-medium text-charcoal-950 transition hover:bg-brass-400 disabled:opacity-50"
          >
            Adicionar
          </button>
        </form>
      </section>

      {/* Horário de funcionamento */}
      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-bone-200/50">
          Horário de funcionamento
        </h2>

        <div className="mt-4 flex flex-col gap-2">
          {WEEKDAY_NAMES.map((name, weekday) => {
            const hour = hours.get(weekday);
            const isOpen = Boolean(hour);
            return (
              <div
                key={weekday}
                className="flex items-center justify-between rounded-sm border border-charcoal-700 bg-charcoal-900 px-4 py-3"
              >
                <label className="flex items-center gap-3 font-body text-sm text-bone-100">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={() => handleToggleDay(weekday, isOpen)}
                    className="accent-brass-500"
                  />
                  {name}
                </label>

                {isOpen && (
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <input
                      type="time"
                      value={hour!.startTime}
                      onChange={(e) => handleHourChange(weekday, "startTime", e.target.value)}
                      className="rounded-sm border border-charcoal-700 bg-charcoal-800 px-2 py-1 text-bone-100 outline-none focus:border-brass-400"
                    />
                    <span className="text-bone-200/40">até</span>
                    <input
                      type="time"
                      value={hour!.endTime}
                      onChange={(e) => handleHourChange(weekday, "endTime", e.target.value)}
                      className="rounded-sm border border-charcoal-700 bg-charcoal-800 px-2 py-1 text-bone-100 outline-none focus:border-brass-400"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

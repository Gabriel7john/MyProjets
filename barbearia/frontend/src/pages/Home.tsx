import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateStrip } from "../components/DateStrip";
import { formatPrice, ServiceCard } from "../components/ServiceCard";
import { SlotGrid } from "../components/SlotGrid";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

interface Service {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  priceCents: number;
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    api.get<Service[]>("/services").then((res) => setServices(res.data));
  }, []);

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot(null);
    api
      .get("/appointments/availability", {
        params: { date: selectedDate, serviceId: selectedService.id },
      })
      .then((res) => setSlots(res.data.slots))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, selectedDate]);

  async function handleConfirm() {
    if (!user) {
      navigate("/entrar");
      return;
    }
    if (!selectedService || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await api.post("/appointments", {
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedSlot,
      });
      setFeedback({ type: "success", text: "Horário reservado. Te esperamos!" });
      setSelectedSlot(null);
      // Atualiza a lista de horários pra refletir a reserva feita
      const res = await api.get("/appointments/availability", {
        params: { date: selectedDate, serviceId: selectedService.id },
      });
      setSlots(res.data.slots);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.response?.data?.error ?? "Não foi possível concluir a reserva.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-charcoal-700">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brass-400">
            Corte, barba &amp; navalha
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold leading-[1.05] text-bone-100 sm:text-6xl">
            Seu horário marcado
            <br />
            <span className="text-brass-400">sem esperar na porta.</span>
          </h1>
          <p className="mt-5 max-w-md font-body text-bone-200/70">
            Escolha o serviço, o dia e o horário. Simples assim — sem ligação, sem fila.
          </p>
        </div>
        <div className="stripe-rule absolute bottom-0 left-0 right-0" />
      </section>

      {/* Fluxo de agendamento */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-bone-200/50">
              01 — Serviço
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selected={selectedService?.id === service.id}
                  onSelect={() => setSelectedService(service)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-bone-200/50">
                02 — Data
              </h2>
              <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
            </div>

            <div>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-bone-200/50">
                03 — Horário
              </h2>
              {selectedService && selectedDate ? (
                <SlotGrid
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelect={setSelectedSlot}
                  loading={loadingSlots}
                />
              ) : (
                <p className="font-mono text-sm text-bone-200/40">
                  Escolha um serviço e uma data primeiro.
                </p>
              )}
            </div>

            {selectedService && selectedDate && selectedSlot && (
              <div className="rounded-sm border border-charcoal-700 bg-charcoal-900 p-5">
                <div className="flex items-center justify-between font-body text-sm text-bone-200/80">
                  <span>
                    {selectedService.name} · {selectedDate.split("-").reverse().join("/")} às{" "}
                    {selectedSlot}
                  </span>
                  <span className="font-mono text-brass-400">
                    {formatPrice(selectedService.priceCents)}
                  </span>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="mt-4 w-full rounded-sm bg-brass-500 py-3 font-medium text-charcoal-950 transition hover:bg-brass-400 disabled:opacity-50"
                >
                  {submitting
                    ? "Reservando..."
                    : user
                      ? "Confirmar agendamento"
                      : "Entrar e confirmar"}
                </button>
              </div>
            )}

            {feedback && (
              <p
                className={`font-mono text-sm ${
                  feedback.type === "success" ? "text-brass-400" : "text-barber-red"
                }`}
              >
                {feedback.text}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

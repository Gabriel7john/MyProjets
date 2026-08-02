interface Service {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  priceCents: number;
}

export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group flex w-full flex-col gap-1 rounded-sm border px-5 py-4 text-left transition ${
        selected
          ? "border-brass-400 bg-charcoal-800"
          : "border-charcoal-700 bg-charcoal-900 hover:border-charcoal-700/60 hover:bg-charcoal-800/60"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-lg text-bone-100">{service.name}</span>
        <span className="font-mono text-sm text-brass-400">{formatPrice(service.priceCents)}</span>
      </div>
      <span className="font-mono text-xs uppercase tracking-wider text-bone-200/50">
        {service.durationMin} min
      </span>
    </button>
  );
}

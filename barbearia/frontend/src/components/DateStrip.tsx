const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

export function DateStrip({
  selectedDate,
  onSelect,
}: {
  selectedDate: string | null;
  onSelect: (isoDate: string) => void;
}) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((d) => {
        const iso = toISODate(d);
        const isSelected = iso === selectedDate;
        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            className={`flex min-w-[64px] flex-col items-center rounded-sm border px-3 py-2.5 transition ${
              isSelected
                ? "border-brass-400 bg-brass-500 text-charcoal-950"
                : "border-charcoal-700 bg-charcoal-900 text-bone-200/80 hover:border-brass-400/60"
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
              {WEEKDAY_LABELS[d.getDay()]}
            </span>
            <span className="font-display text-xl font-semibold">{d.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SlotGrid({
  slots,
  selectedSlot,
  onSelect,
  loading,
}: {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return <p className="font-mono text-sm text-bone-200/50">Carregando horários...</p>;
  }

  if (slots.length === 0) {
    return (
      <p className="font-mono text-sm text-bone-200/50">
        Nenhum horário disponível nesse dia. Tente outra data.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {slots.map((slot) => {
        const isSelected = slot === selectedSlot;
        return (
          <button
            key={slot}
            onClick={() => onSelect(slot)}
            className={`rounded-sm border px-2 py-2 font-mono text-sm transition ${
              isSelected
                ? "border-brass-400 bg-brass-500 text-charcoal-950"
                : "border-charcoal-700 bg-charcoal-900 text-bone-200/80 hover:border-brass-400/60"
            }`}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}

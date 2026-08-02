// Funções auxiliares para trabalhar com horários no formato "HH:mm"

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Verifica se dois intervalos de tempo se sobrepõem
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
}

// Gera os horários de início possíveis para um serviço dentro do expediente,
// removendo os que colidem com agendamentos já existentes ou bloqueios
export function generateAvailableSlots(params: {
  workStart: string;
  workEnd: string;
  serviceDurationMin: number;
  stepMin?: number;
  taken: { startTime: string; endTime: string }[];
}): string[] {
  const { workStart, workEnd, serviceDurationMin, taken } = params;
  const stepMin = params.stepMin ?? 15;

  const startMinutes = timeToMinutes(workStart);
  const endMinutes = timeToMinutes(workEnd);

  const slots: string[] = [];

  for (
    let slotStart = startMinutes;
    slotStart + serviceDurationMin <= endMinutes;
    slotStart += stepMin
  ) {
    const slotStartTime = minutesToTime(slotStart);
    const slotEndTime = minutesToTime(slotStart + serviceDurationMin);

    const hasConflict = taken.some((busy) =>
      rangesOverlap(slotStartTime, slotEndTime, busy.startTime, busy.endTime)
    );

    if (!hasConflict) {
      slots.push(slotStartTime);
    }
  }

  return slots;
}

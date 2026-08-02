import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Populando banco de dados...");

  // Horário de funcionamento: terça a sábado, 09:00 às 19:00
  const workingDays = [2, 3, 4, 5, 6]; // 0=domingo, 1=segunda...
  for (const weekday of workingDays) {
    await prisma.workingHours.upsert({
      where: { weekday },
      update: {},
      create: { weekday, startTime: "09:00", endTime: "19:00" },
    });
  }

  await prisma.service.createMany({
    data: [
      { name: "Corte de cabelo", durationMin: 30, priceCents: 4000 },
      { name: "Barba", durationMin: 20, priceCents: 3000 },
      { name: "Corte + Barba", durationMin: 45, priceCents: 6500 },
      { name: "Sobrancelha", durationMin: 10, priceCents: 1500 },
    ],
    skipDuplicates: true,
  });

  console.log("Seed concluído.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

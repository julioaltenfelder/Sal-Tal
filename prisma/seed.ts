import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1) Usuário admin inicial ---------------------------------------------------
  const login = "admin";
  const senha = "saletal2025"; // TROQUE após o primeiro acesso
  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuarioAdmin.upsert({
    where: { login },
    update: {},
    create: {
      login,
      nome: "Administrador",
      senhaHash,
    },
  });
  console.log(`✓ Admin criado — login: "${login}" / senha: "${senha}"`);

  // 2) Configuração padrão -----------------------------------------------------
  await prisma.configuracao.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", maxAdultos: 30, maxCriancas: 30 },
  });
  console.log("✓ Configuração padrão (máx. 30 adultos / 30 crianças)");

  // 3) Datas disponíveis: próximos 8 fins de semana ----------------------------
  const hoje = new Date();
  const datas: Date[] = [];
  const cursor = new Date(hoje);
  while (datas.length < 8) {
    cursor.setDate(cursor.getDate() + 1);
    const diaSemana = cursor.getDay(); // 0=domingo, 6=sábado
    if (diaSemana === 6 || diaSemana === 0) {
      // meio-dia no fuso de São Paulo
      const d = new Date(
        `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
          cursor.getDate(),
        ).padStart(2, "0")}T12:00:00-03:00`,
      );
      datas.push(d);
    }
  }

  for (const data of datas) {
    await prisma.dataDisponivel.upsert({
      where: { data },
      update: {},
      create: { data, ativa: true },
    });
  }
  console.log(`✓ ${datas.length} datas disponíveis (próximos fins de semana)`);

  console.log("\nSeed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

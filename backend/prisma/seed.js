import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

// 1. Configura a conexão nativa do Postgres exigida pelo Prisma 7
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 2. Verifica se o admin já existe
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminExists) {
    console.log('🛠️ Nenhum admin encontrado. Criando admin padrão...');

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    // 3. Cria o admin no banco
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'ADMIN', 
      },
    });

    console.log('🚀 Admin padrão cadastrado com sucesso!');
  } else {
    console.log('✅ Admin já existe no banco Postgres.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // 4. Fecha as conexões do Prisma e do Pool do Postgres ao terminar
    await prisma.$disconnect();
    await pool.end();
  });
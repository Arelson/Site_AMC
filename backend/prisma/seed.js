import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { fakerPT_BR as faker } from "@faker-js/faker";
import pg from 'pg';
import bcrypt from 'bcrypt';

// 1. Configura a conexão nativa do Postgres exigida pelo Prisma 7
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

const termosAcademicos = [
  "Inteligência Artificial",
  "Redes Neurais",
  "Aprendizado de Máquina",
  "Sustentabilidade",
  "Energia Limpa",
  "Computação Quântica",
  "Educação Tecnológica",
  "Robótica",
  "Algoritmos Genéticos",
  "Internet das Coisas",
];

async function main() {
  console.log("🌱 Iniciando o Seeder...");
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

  const autor = await prisma.user.upsert({
    where: { email: "admin@amc.com.br" },
    update: {},
    create: {
      name: "Dr. Arlison Gaspar",
      email: "admin@amc.com.br",
      password: "senha_criptografada_fake",
      role: "ADMIN",
      member: {
        create: {
          name: "Dr. Arlison Gaspar",
          cargo: "Pesquisador Sênior",
          bio: "Especialista em Inteligência Artificial e sistemas distribuídos.",
        },
      },
    },
  });

  console.log("👤 Autor criado:", autor.name);

  // 2. Gerar 50 Posts de Blog
  console.log("📝 Gerando 50 posts de blog...");
  for (let i = 0; i < 50; i++) {
    const termoAleatorio = faker.helpers.arrayElement(termosAcademicos);

    // Sorteia onde o termo vai aparecer: 1 = Título, 2 = Texto, 3 = Keywords
    const posicaoTermo = faker.helpers.rangeToNumber({ min: 1, max: 3 });

    await prisma.post.create({
      data: {
        title:
          posicaoTermo === 1
            ? `O impacto da ${termoAleatorio} no futuro`
            : faker.lorem.sentence(),
        content:
          posicaoTermo === 2
            ? `<p>${faker.lorem.paragraphs(2)} A aplicação de ${termoAleatorio} é fundamental. ${faker.lorem.paragraph()}</p>`
            : `<p>${faker.lorem.paragraphs(3)}</p>`,
        keywords:
          posicaoTermo === 3
            ? `${termoAleatorio}, tecnologia, pesquisa`
            : "ciência, estudo",
        status: faker.helpers.arrayElement([
          "PUBLICADO",
          "PUBLICADO",
          "PUBLICADO",
          "RASCUNHO",
        ]), // 75% publicado
        banner: faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
        createdAt: faker.date.past({ years: 1 }), // Datas aleatórias do último ano
        authorId: autor.id,
      },
    });
  }

  // 3. Gerar 50 Notícias
  console.log("📰 Gerando 50 notícias...");
  for (let i = 0; i < 50; i++) {
    const termoAleatorio = faker.helpers.arrayElement(termosAcademicos);

    await prisma.news.create({
      data: {
        title: `AMC lança novo projeto sobre ${termoAleatorio}`,
        content: `<p>A Academia Maranhense de Ciências debateu hoje sobre ${termoAleatorio}. ${faker.lorem.paragraphs(2)}</p>`,
        keywords: faker.helpers.arrayElement([
          "CIÊNCIA",
          "EVENTOS",
          "ACADEMIA",
          "PARCERIAS",
          "EDITAIS",
        ]),
        status: "PUBLICADO",
        banner: faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
        createdAt: faker.date.past({ years: 2 }), // Datas dos últimos 2 anos
        authorId: autor.id,
      },
    });
  }

  console.log("✅ Banco de dados populado com sucesso!");
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // 4. Fecha as conexões do Prisma e do Pool do Postgres ao terminar
    await prisma.$disconnect();
    // await pool.end();
  });
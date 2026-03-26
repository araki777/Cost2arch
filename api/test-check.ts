import { PrismaClient } from './lib/prisma-client/index.js';

const prisma = new PrismaClient();

async function main() {
  const latest = await prisma.architectureResult.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log('--- LATEST ARCHITECTURE RESULT ---');
  if (latest) {
    console.log('ID:', latest.id);
    console.log('System Name:', latest.systemName);
    console.log('DOT Code:', latest.dotCode);
  } else {
    console.log('No results found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

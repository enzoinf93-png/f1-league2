import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const r1 = await prisma.gpResult.deleteMany();
  const r2 = await prisma.score.deleteMany();
  const r3 = await prisma.grandPrix.updateMany({ data: { isResultEntered: false } });
  console.log('GpResult eliminati:', r1.count);
  console.log('Score eliminati:', r2.count);
  console.log('GP flag resettati:', r3.count);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

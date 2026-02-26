import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sprint weekends 2025: Cina (2), Miami (6), Belgio (13), USA (19), Brasile (21), Qatar (23)
const SPRINT_ROUNDS_2025 = new Set([2, 6, 13, 19, 21, 23]);
// Sprint weekends 2026: stessa struttura attesa
const SPRINT_ROUNDS_2026 = new Set([2, 6, 13, 19, 21, 23]);

const f1Calendar2025 = [
  { round: 1,  name: 'Australian Grand Prix',     country: 'Australia',      circuit: 'Albert Park',                  qualifyingStart: new Date('2025-03-15T05:00:00Z'), raceStart: new Date('2025-03-16T05:00:00Z') },
  { round: 2,  name: 'Chinese Grand Prix',         country: 'China',          circuit: 'Shanghai',                     qualifyingStart: new Date('2025-03-22T07:00:00Z'), raceStart: new Date('2025-03-23T07:00:00Z') },
  { round: 3,  name: 'Japanese Grand Prix',        country: 'Japan',          circuit: 'Suzuka',                       qualifyingStart: new Date('2025-04-05T06:00:00Z'), raceStart: new Date('2025-04-06T05:00:00Z') },
  { round: 4,  name: 'Bahrain Grand Prix',         country: 'Bahrain',        circuit: 'Bahrain International',        qualifyingStart: new Date('2025-04-12T14:00:00Z'), raceStart: new Date('2025-04-13T15:00:00Z') },
  { round: 5,  name: 'Saudi Arabian Grand Prix',   country: 'Saudi Arabia',   circuit: 'Jeddah Corniche',              qualifyingStart: new Date('2025-04-19T17:00:00Z'), raceStart: new Date('2025-04-20T17:00:00Z') },
  { round: 6,  name: 'Miami Grand Prix',           country: 'USA',            circuit: 'Miami International',          qualifyingStart: new Date('2025-05-03T20:00:00Z'), raceStart: new Date('2025-05-04T19:00:00Z') },
  { round: 7,  name: 'Emilia Romagna Grand Prix',  country: 'Italy',          circuit: 'Imola',                        qualifyingStart: new Date('2025-05-17T13:00:00Z'), raceStart: new Date('2025-05-18T13:00:00Z') },
  { round: 8,  name: 'Monaco Grand Prix',          country: 'Monaco',         circuit: 'Circuit de Monaco',            qualifyingStart: new Date('2025-05-24T13:00:00Z'), raceStart: new Date('2025-05-25T13:00:00Z') },
  { round: 9,  name: 'Spanish Grand Prix',         country: 'Spain',          circuit: 'Circuit de Barcelona',         qualifyingStart: new Date('2025-05-31T13:00:00Z'), raceStart: new Date('2025-06-01T13:00:00Z') },
  { round: 10, name: 'Canadian Grand Prix',        country: 'Canada',         circuit: 'Circuit Gilles Villeneuve',    qualifyingStart: new Date('2025-06-14T19:00:00Z'), raceStart: new Date('2025-06-15T18:00:00Z') },
  { round: 11, name: 'Austrian Grand Prix',        country: 'Austria',        circuit: 'Red Bull Ring',                qualifyingStart: new Date('2025-06-28T13:00:00Z'), raceStart: new Date('2025-06-29T13:00:00Z') },
  { round: 12, name: 'British Grand Prix',         country: 'United Kingdom', circuit: 'Silverstone',                  qualifyingStart: new Date('2025-07-05T13:00:00Z'), raceStart: new Date('2025-07-06T13:00:00Z') },
  { round: 13, name: 'Belgian Grand Prix',         country: 'Belgium',        circuit: 'Circuit de Spa',               qualifyingStart: new Date('2025-07-26T13:00:00Z'), raceStart: new Date('2025-07-27T13:00:00Z') },
  { round: 14, name: 'Hungarian Grand Prix',       country: 'Hungary',        circuit: 'Hungaroring',                  qualifyingStart: new Date('2025-08-02T13:00:00Z'), raceStart: new Date('2025-08-03T13:00:00Z') },
  { round: 15, name: 'Dutch Grand Prix',           country: 'Netherlands',    circuit: 'Zandvoort',                    qualifyingStart: new Date('2025-08-30T13:00:00Z'), raceStart: new Date('2025-08-31T13:00:00Z') },
  { round: 16, name: 'Italian Grand Prix',         country: 'Italy',          circuit: 'Monza',                        qualifyingStart: new Date('2025-09-06T13:00:00Z'), raceStart: new Date('2025-09-07T13:00:00Z') },
  { round: 17, name: 'Azerbaijan Grand Prix',      country: 'Azerbaijan',     circuit: 'Baku City Circuit',            qualifyingStart: new Date('2025-09-20T12:00:00Z'), raceStart: new Date('2025-09-21T11:00:00Z') },
  { round: 18, name: 'Singapore Grand Prix',       country: 'Singapore',      circuit: 'Marina Bay Street',            qualifyingStart: new Date('2025-10-04T09:00:00Z'), raceStart: new Date('2025-10-05T08:00:00Z') },
  { round: 19, name: 'United States Grand Prix',   country: 'USA',            circuit: 'Circuit of the Americas',      qualifyingStart: new Date('2025-10-18T20:00:00Z'), raceStart: new Date('2025-10-19T19:00:00Z') },
  { round: 20, name: 'Mexico City Grand Prix',     country: 'Mexico',         circuit: 'Autodromo Hermanos Rodriguez', qualifyingStart: new Date('2025-10-25T20:00:00Z'), raceStart: new Date('2025-10-26T20:00:00Z') },
  { round: 21, name: 'São Paulo Grand Prix',       country: 'Brazil',         circuit: 'Interlagos',                   qualifyingStart: new Date('2025-11-08T17:00:00Z'), raceStart: new Date('2025-11-09T17:00:00Z') },
  { round: 22, name: 'Las Vegas Grand Prix',       country: 'USA',            circuit: 'Las Vegas Strip',              qualifyingStart: new Date('2025-11-22T06:00:00Z'), raceStart: new Date('2025-11-23T06:00:00Z') },
  { round: 23, name: 'Qatar Grand Prix',           country: 'Qatar',          circuit: 'Lusail International',         qualifyingStart: new Date('2025-11-29T13:00:00Z'), raceStart: new Date('2025-11-30T13:00:00Z') },
  { round: 24, name: 'Abu Dhabi Grand Prix',       country: 'UAE',            circuit: 'Yas Marina',                   qualifyingStart: new Date('2025-12-06T13:00:00Z'), raceStart: new Date('2025-12-07T13:00:00Z') },
];

const f1Calendar2026 = [
  { round: 1,  name: 'Australian Grand Prix',     country: 'Australia',      circuit: 'Albert Park',                  qualifyingStart: new Date('2026-03-14T05:00:00Z'), raceStart: new Date('2026-03-15T05:00:00Z') },
  { round: 2,  name: 'Chinese Grand Prix',         country: 'China',          circuit: 'Shanghai',                     qualifyingStart: new Date('2026-03-21T07:00:00Z'), raceStart: new Date('2026-03-22T07:00:00Z') },
  { round: 3,  name: 'Japanese Grand Prix',        country: 'Japan',          circuit: 'Suzuka',                       qualifyingStart: new Date('2026-04-04T06:00:00Z'), raceStart: new Date('2026-04-05T05:00:00Z') },
  { round: 4,  name: 'Bahrain Grand Prix',         country: 'Bahrain',        circuit: 'Bahrain International',        qualifyingStart: new Date('2026-04-18T14:00:00Z'), raceStart: new Date('2026-04-19T15:00:00Z') },
  { round: 5,  name: 'Saudi Arabian Grand Prix',   country: 'Saudi Arabia',   circuit: 'Jeddah Corniche',              qualifyingStart: new Date('2026-04-25T17:00:00Z'), raceStart: new Date('2026-04-26T17:00:00Z') },
  { round: 6,  name: 'Miami Grand Prix',           country: 'USA',            circuit: 'Miami International',          qualifyingStart: new Date('2026-05-09T20:00:00Z'), raceStart: new Date('2026-05-10T19:00:00Z') },
  { round: 7,  name: 'Emilia Romagna Grand Prix',  country: 'Italy',          circuit: 'Imola',                        qualifyingStart: new Date('2026-05-23T13:00:00Z'), raceStart: new Date('2026-05-24T13:00:00Z') },
  { round: 8,  name: 'Monaco Grand Prix',          country: 'Monaco',         circuit: 'Circuit de Monaco',            qualifyingStart: new Date('2026-05-30T13:00:00Z'), raceStart: new Date('2026-05-31T13:00:00Z') },
  { round: 9,  name: 'Spanish Grand Prix',         country: 'Spain',          circuit: 'Circuit de Barcelona',         qualifyingStart: new Date('2026-06-06T13:00:00Z'), raceStart: new Date('2026-06-07T13:00:00Z') },
  { round: 10, name: 'Canadian Grand Prix',        country: 'Canada',         circuit: 'Circuit Gilles Villeneuve',    qualifyingStart: new Date('2026-06-13T19:00:00Z'), raceStart: new Date('2026-06-14T18:00:00Z') },
  { round: 11, name: 'Austrian Grand Prix',        country: 'Austria',        circuit: 'Red Bull Ring',                qualifyingStart: new Date('2026-06-27T13:00:00Z'), raceStart: new Date('2026-06-28T13:00:00Z') },
  { round: 12, name: 'British Grand Prix',         country: 'United Kingdom', circuit: 'Silverstone',                  qualifyingStart: new Date('2026-07-04T13:00:00Z'), raceStart: new Date('2026-07-05T13:00:00Z') },
  { round: 13, name: 'Belgian Grand Prix',         country: 'Belgium',        circuit: 'Circuit de Spa',               qualifyingStart: new Date('2026-07-25T13:00:00Z'), raceStart: new Date('2026-07-26T13:00:00Z') },
  { round: 14, name: 'Hungarian Grand Prix',       country: 'Hungary',        circuit: 'Hungaroring',                  qualifyingStart: new Date('2026-08-01T13:00:00Z'), raceStart: new Date('2026-08-02T13:00:00Z') },
  { round: 15, name: 'Dutch Grand Prix',           country: 'Netherlands',    circuit: 'Zandvoort',                    qualifyingStart: new Date('2026-08-29T13:00:00Z'), raceStart: new Date('2026-08-30T13:00:00Z') },
  { round: 16, name: 'Italian Grand Prix',         country: 'Italy',          circuit: 'Monza',                        qualifyingStart: new Date('2026-09-05T13:00:00Z'), raceStart: new Date('2026-09-06T13:00:00Z') },
  { round: 17, name: 'Azerbaijan Grand Prix',      country: 'Azerbaijan',     circuit: 'Baku City Circuit',            qualifyingStart: new Date('2026-09-19T12:00:00Z'), raceStart: new Date('2026-09-20T11:00:00Z') },
  { round: 18, name: 'Singapore Grand Prix',       country: 'Singapore',      circuit: 'Marina Bay Street',            qualifyingStart: new Date('2026-10-03T09:00:00Z'), raceStart: new Date('2026-10-04T08:00:00Z') },
  { round: 19, name: 'United States Grand Prix',   country: 'USA',            circuit: 'Circuit of the Americas',      qualifyingStart: new Date('2026-10-17T20:00:00Z'), raceStart: new Date('2026-10-18T19:00:00Z') },
  { round: 20, name: 'Mexico City Grand Prix',     country: 'Mexico',         circuit: 'Autodromo Hermanos Rodriguez', qualifyingStart: new Date('2026-10-24T20:00:00Z'), raceStart: new Date('2026-10-25T20:00:00Z') },
  { round: 21, name: 'São Paulo Grand Prix',       country: 'Brazil',         circuit: 'Interlagos',                   qualifyingStart: new Date('2026-11-07T17:00:00Z'), raceStart: new Date('2026-11-08T17:00:00Z') },
  { round: 22, name: 'Las Vegas Grand Prix',       country: 'USA',            circuit: 'Las Vegas Strip',              qualifyingStart: new Date('2026-11-21T06:00:00Z'), raceStart: new Date('2026-11-22T06:00:00Z') },
  { round: 23, name: 'Qatar Grand Prix',           country: 'Qatar',          circuit: 'Lusail International',         qualifyingStart: new Date('2026-11-28T13:00:00Z'), raceStart: new Date('2026-11-29T13:00:00Z') },
  { round: 24, name: 'Abu Dhabi Grand Prix',       country: 'UAE',            circuit: 'Yas Marina',                   qualifyingStart: new Date('2026-12-05T13:00:00Z'), raceStart: new Date('2026-12-06T13:00:00Z') },
];

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@f1league.com' },
    update: {},
    create: { email: 'admin@f1league.com', passwordHash: adminPassword, username: 'Admin', role: 'ADMIN' },
  });
  console.log('Admin user: admin@f1league.com');

  for (const gp of f1Calendar2025) {
    await prisma.grandPrix.upsert({
      where: { year_round: { year: 2025, round: gp.round } },
      update: { hasSprint: SPRINT_ROUNDS_2025.has(gp.round) },
      create: { year: 2025, hasSprint: SPRINT_ROUNDS_2025.has(gp.round), ...gp },
    });
  }
  console.log(`2025: ${f1Calendar2025.length} GP (${SPRINT_ROUNDS_2025.size} con sprint)`);

  for (const gp of f1Calendar2026) {
    await prisma.grandPrix.upsert({
      where: { year_round: { year: 2026, round: gp.round } },
      update: { hasSprint: SPRINT_ROUNDS_2026.has(gp.round) },
      create: { year: 2026, hasSprint: SPRINT_ROUNDS_2026.has(gp.round), ...gp },
    });
  }
  console.log(`2026: ${f1Calendar2026.length} GP (${SPRINT_ROUNDS_2026.size} con sprint)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

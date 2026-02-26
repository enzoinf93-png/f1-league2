import prisma from './prisma';

interface ScoringCfg {
  pointsP1: number;
  pointsP2: number;
  pointsP3: number;
  pointsPodioBonus: number;
  pointsPole: number;
  pointsFastestLap: number;
  pointsSafetyCar: number;
  pointsRetirement: number;
  pointsConstructor: number;
  pointsSprintPole: number;
  pointsSprintP1: number;
  pointsSprintP2: number;
  pointsSprintP3: number;
  pointsSprintPodioBonus: number;
  pointsFastestPitStop: number;
}

const DEFAULT_SCORING: ScoringCfg = {
  pointsP1: 10,
  pointsP2: 7,
  pointsP3: 5,
  pointsPodioBonus: 5,
  pointsPole: 5,
  pointsFastestLap: 5,
  pointsSafetyCar: 3,
  pointsRetirement: 8,
  pointsConstructor: 4,
  pointsSprintPole: 3,
  pointsSprintP1: 7,
  pointsSprintP2: 5,
  pointsSprintP3: 3,
  pointsSprintPodioBonus: 3,
  pointsFastestPitStop: 4,
};

function calcBreakdown(
  predictions: { type: string; value: string }[],
  results: { type: string; value: string }[],
  cfg: ScoringCfg
): { breakdown: Record<string, number>; total: number } {
  const resultMap = new Map(results.map((r) => [r.type, r.value]));
  const predMap = new Map(predictions.map((p) => [p.type, p.value]));
  const breakdown: Record<string, number> = {};

  const check = (type: string, pts: number) => {
    const predicted = predMap.get(type);
    const actual = resultMap.get(type);
    if (predicted && actual && predicted === actual) breakdown[type] = pts;
  };

  check('P1', cfg.pointsP1);
  check('P2', cfg.pointsP2);
  check('P3', cfg.pointsP3);
  check('POLE', cfg.pointsPole);
  check('FASTEST_LAP', cfg.pointsFastestLap);
  check('SAFETY_CAR', cfg.pointsSafetyCar);
  check('FIRST_RETIREMENT', cfg.pointsRetirement);
  check('CONSTRUCTOR_WINNER', cfg.pointsConstructor);
  check('SPRINT_POLE', cfg.pointsSprintPole);
  check('SPRINT_P1', cfg.pointsSprintP1);
  check('SPRINT_P2', cfg.pointsSprintP2);
  check('SPRINT_P3', cfg.pointsSprintP3);
  check('FASTEST_PIT_STOP', cfg.pointsFastestPitStop);

  if (breakdown['P1'] !== undefined && breakdown['P2'] !== undefined && breakdown['P3'] !== undefined)
    breakdown['PODIO_BONUS'] = cfg.pointsPodioBonus;

  if (breakdown['SPRINT_P1'] !== undefined && breakdown['SPRINT_P2'] !== undefined && breakdown['SPRINT_P3'] !== undefined)
    breakdown['SPRINT_PODIO_BONUS'] = cfg.pointsSprintPodioBonus;

  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
  return { breakdown, total };
}

export async function calculateScoresForGp(grandPrixId: string): Promise<void> {
  const results = await prisma.gpResult.findMany({ where: { grandPrixId } });
  if (results.length === 0) return;

  const leagues = await prisma.league.findMany({
    include: { members: true, scoringConfig: true },
  });

  for (const league of leagues) {
    const sc = league.scoringConfig;
    const cfg: ScoringCfg = sc ? {
      pointsP1: sc.pointsP1, pointsP2: sc.pointsP2, pointsP3: sc.pointsP3,
      pointsPodioBonus: sc.pointsPodioBonus, pointsPole: sc.pointsPole,
      pointsFastestLap: sc.pointsFastestLap, pointsSafetyCar: sc.pointsSafetyCar,
      pointsRetirement: sc.pointsRetirement, pointsConstructor: sc.pointsConstructor,
      pointsSprintPole: sc.pointsSprintPole, pointsSprintP1: sc.pointsSprintP1,
      pointsSprintP2: sc.pointsSprintP2, pointsSprintP3: sc.pointsSprintP3,
      pointsSprintPodioBonus: sc.pointsSprintPodioBonus, pointsFastestPitStop: sc.pointsFastestPitStop,
    } : DEFAULT_SCORING;

    for (const member of league.members) {
      const predictions = await prisma.prediction.findMany({ where: { userId: member.userId, grandPrixId } });
      const { breakdown, total } = calcBreakdown(predictions, results, cfg);

      await prisma.score.upsert({
        where: { userId_grandPrixId_leagueId: { userId: member.userId, grandPrixId, leagueId: league.id } },
        update: { points: total, breakdown: JSON.stringify(breakdown), calculatedAt: new Date() },
        create: { userId: member.userId, grandPrixId, leagueId: league.id, points: total, breakdown: JSON.stringify(breakdown) },
      });
    }
  }
}

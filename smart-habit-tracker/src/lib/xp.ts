import { prisma } from "@/lib/prisma";
import { todayIST, istDateToUTC } from "@/lib/timezone";

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

export function getRank(totalXp: number): string {
  if (totalXp >= XP_THRESHOLDS[10]) return "S";
  if (totalXp >= XP_THRESHOLDS[8]) return "A";
  if (totalXp >= XP_THRESHOLDS[6]) return "B";
  if (totalXp >= XP_THRESHOLDS[4]) return "C";
  if (totalXp >= XP_THRESHOLDS[2]) return "D";
  return "E";
}

export function getLevel(totalXp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export async function awardXp(userId: string, amount: number) {
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings) return;

  const today = todayIST();
  let { currentStreak, bestStreak, lastActiveDateIST, totalXp } = settings;

  // Streak calculation
  if (!lastActiveDateIST) {
    currentStreak = 1;
  } else if (lastActiveDateIST !== today) {
    const lastActive = istDateToUTC(lastActiveDateIST);
    const todayDate = istDateToUTC(today);
    
    // Difference in days
    const diffTime = Math.abs(todayDate.getTime() - lastActive.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1; // broken streak
    }
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  totalXp += amount;
  const rank = getRank(totalXp);

  await prisma.userSettings.update({
    where: { userId },
    data: {
      totalXp,
      currentStreak,
      bestStreak,
      lastActiveDateIST: today,
      rank,
    },
  });
}

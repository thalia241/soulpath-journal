import { supabase } from "../lib/supabase";

export type MoodInsight = {
  mood: string;
  count: number;
};

export type EnergyInsight = {
  level: number;
  count: number;
};

export type PracticeInsight = {
  id: string;
  name: string;
  count: number;
};

export type SoulPathInsights = {
  totalEntries: number;
  averageEnergy: number | null;
  mostCommonMood: string | null;

  moodDistribution: MoodInsight[];
  energyDistribution: EnergyInsight[];

  practiceUsage: PracticeInsight[];
  mostUsedPractice: PracticeInsight | null;

  dreamCount: number;
  synchronicityCount: number;

  observations: string[];
};

type JournalInsightRow = {
  id: string;
  mood: string | null;
  energy_level: number | null;
  entry_date: string;
};

type EntryPracticeRow = {
  practice_id: string;

  practice:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

function calculateMoodDistribution(
  entries: JournalInsightRow[]
): MoodInsight[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.mood) {
      continue;
    }

    counts.set(
      entry.mood,
      (counts.get(entry.mood) ?? 0) + 1
    );
  }

  return Array.from(counts.entries())
    .map(([mood, count]) => ({
      mood,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateEnergyDistribution(
  entries: JournalInsightRow[]
): EnergyInsight[] {
  const levels = [1, 2, 3, 4, 5];

  return levels.map((level) => ({
    level,
    count: entries.filter(
      (entry) =>
        entry.energy_level === level
    ).length,
  }));
}

function calculateAverageEnergy(
  entries: JournalInsightRow[]
) {
  const energyEntries = entries.filter(
    (entry) =>
      entry.energy_level !== null
  );

  if (energyEntries.length === 0) {
    return null;
  }

  const total = energyEntries.reduce(
    (sum, entry) =>
      sum +
      (entry.energy_level ?? 0),
    0
  );

  return Number(
    (
      total / energyEntries.length
    ).toFixed(1)
  );
}

function buildObservations(
  entries: JournalInsightRow[],
  moods: MoodInsight[],
  practiceUsage: PracticeInsight[],
  averageEnergy: number | null,
  dreamCount: number,
  synchronicityCount: number
) {
  const observations: string[] = [];

  if (entries.length === 0) {
    return [
      "Your patterns will begin appearing after you record more reflections.",
    ];
  }

  if (moods.length > 0) {
    const topMood = moods[0];

    observations.push(
      `${topMood.mood} is your most frequently recorded mood so far, appearing in ${topMood.count} ${
        topMood.count === 1
          ? "reflection"
          : "reflections"
      }.`
    );
  }

  if (averageEnergy !== null) {
    observations.push(
      `Your recorded average energy level is ${averageEnergy} out of 5.`
    );
  }

  if (practiceUsage.length > 0) {
    const topPractice =
      practiceUsage[0];

    observations.push(
      `${topPractice.name} is your most frequently recorded spiritual practice so far.`
    );
  }

  if (dreamCount > 0) {
    observations.push(
      `You have recorded ${dreamCount} ${
        dreamCount === 1
          ? "dream"
          : "dreams"
      }.`
    );
  }

  if (synchronicityCount > 0) {
    observations.push(
      `You have recorded ${synchronicityCount} ${
        synchronicityCount === 1
          ? "synchronicity"
          : "synchronicities"
      }.`
    );
  }

  return observations.slice(0, 5);
}

export async function getSoulPathInsights(): Promise<SoulPathInsights> {
  const [
    journalResponse,
    practicesResponse,
    dreamsResponse,
    synchronicitiesResponse,
  ] = await Promise.all([
    supabase
      .from("journal_entries")
      .select(
        "id, mood, energy_level, entry_date"
      ),

    supabase
      .from("entry_practices")
      .select(`
        practice_id,
        practice:practices (
          id,
          name
        )
      `),

    supabase
      .from("experiences")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "experience_type",
        "dream"
      ),

    supabase
      .from("experiences")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "experience_type",
        "synchronicity"
      ),
  ]);

  if (journalResponse.error) {
    throw journalResponse.error;
  }

  if (practicesResponse.error) {
    throw practicesResponse.error;
  }

  if (dreamsResponse.error) {
    throw dreamsResponse.error;
  }

  if (
    synchronicitiesResponse.error
  ) {
    throw synchronicitiesResponse.error;
  }

  const journalEntries =
    (journalResponse.data ??
      []) as JournalInsightRow[];

  const moodDistribution =
    calculateMoodDistribution(
      journalEntries
    );

  const energyDistribution =
    calculateEnergyDistribution(
      journalEntries
    );

  const averageEnergy =
    calculateAverageEnergy(
      journalEntries
    );

  const practiceMap = new Map<
    string,
    PracticeInsight
  >();

  const practiceRows =
    (practicesResponse.data ??
      []) as unknown as EntryPracticeRow[];

  for (const row of practiceRows) {
    const practice = Array.isArray(
      row.practice
    )
      ? row.practice[0]
      : row.practice;

    if (!practice) {
      continue;
    }

    const current =
      practiceMap.get(practice.id);

    if (current) {
      current.count += 1;
    } else {
      practiceMap.set(
        practice.id,
        {
          id: practice.id,
          name: practice.name,
          count: 1,
        }
      );
    }
  }

  const practiceUsage =
    Array.from(
      practiceMap.values()
    ).sort(
      (a, b) =>
        b.count - a.count
    );

  const dreamCount =
    dreamsResponse.count ?? 0;

  const synchronicityCount =
    synchronicitiesResponse.count ??
    0;

  const observations =
    buildObservations(
      journalEntries,
      moodDistribution,
      practiceUsage,
      averageEnergy,
      dreamCount,
      synchronicityCount
    );

  return {
    totalEntries:
      journalEntries.length,

    averageEnergy,

    mostCommonMood:
      moodDistribution[0]
        ?.mood ?? null,

    moodDistribution,

    energyDistribution,

    practiceUsage,

    mostUsedPractice:
      practiceUsage[0] ?? null,

    dreamCount,

    synchronicityCount,

    observations,
  };
} 
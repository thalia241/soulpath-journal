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

export type TrendPeriod = {
  days: number;
  entryCount: number;
  averageEnergy: number | null;
  mostCommonMood: string | null;
  moodDistribution: MoodInsight[];
};

export type PracticeObservation = {
  practiceId: string;
  practiceName: string;

  timesRecorded: number;

  averageEnergy: number | null;

  mostCommonMood: string | null;

  energyDifferenceFromOverall: number | null;
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

  sevenDayTrend: TrendPeriod;

  thirtyDayTrend: TrendPeriod;

  practiceObservations: PracticeObservation[];

  observations: string[];
};

type JournalInsightRow = {
  id: string;

  mood: string | null;

  energy_level: number | null;

  entry_date: string;

  created_at: string;
};

type PracticeRelation = {
  id: string;
  name: string;
};

type EntryPracticeRow = {
  entry_id: string;

  practice_id: string;

  practice:
    | PracticeRelation
    | PracticeRelation[]
    | null;
};

function getLocalDateString(
  date: Date
) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStartDate(
  days: number
) {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  date.setDate(
    date.getDate() - (days - 1)
  );

  return getLocalDateString(date);
}

function calculateMoodDistribution(
  entries: JournalInsightRow[]
): MoodInsight[] {
  const counts =
    new Map<string, number>();

  for (const entry of entries) {
    if (!entry.mood) {
      continue;
    }

    counts.set(
      entry.mood,

      (counts.get(entry.mood) ?? 0) +
        1
    );
  }

  return Array.from(
    counts.entries()
  )
    .map(([mood, count]) => ({
      mood,
      count,
    }))

    .sort(
      (a, b) => b.count - a.count
    );
}

function calculateEnergyDistribution(
  entries: JournalInsightRow[]
): EnergyInsight[] {
  return [1, 2, 3, 4, 5].map(
    (level) => ({
      level,

      count: entries.filter(
        (entry) =>
          entry.energy_level ===
          level
      ).length,
    })
  );
}

function calculateAverageEnergy(
  entries: JournalInsightRow[]
) {
  const values = entries
    .map(
      (entry) =>
        entry.energy_level
    )
    .filter(
      (
        value
      ): value is number =>
        value !== null
    );

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce(
    (sum, value) =>
      sum + value,
    0
  );

  return Number(
    (
      total / values.length
    ).toFixed(1)
  );
}

function getMostCommonMood(
  entries: JournalInsightRow[]
) {
  return (
    calculateMoodDistribution(
      entries
    )[0]?.mood ?? null
  );
}

function calculateTrend(
  allEntries: JournalInsightRow[],
  days: number
): TrendPeriod {
  const startDate =
    getStartDate(days);

  const entries =
    allEntries.filter(
      (entry) =>
        entry.entry_date >= startDate
    );

  return {
    days,

    entryCount: entries.length,

    averageEnergy:
      calculateAverageEnergy(
        entries
      ),

    mostCommonMood:
      getMostCommonMood(entries),

    moodDistribution:
      calculateMoodDistribution(
        entries
      ),
  };
}

function calculatePracticeUsage(
  rows: EntryPracticeRow[]
): PracticeInsight[] {
  const map =
    new Map<
      string,
      PracticeInsight
    >();

  for (const row of rows) {
    const practice =
      Array.isArray(row.practice)
        ? row.practice[0]
        : row.practice;

    if (!practice) {
      continue;
    }

    const current =
      map.get(practice.id);

    if (current) {
      current.count += 1;
    } else {
      map.set(practice.id, {
        id: practice.id,

        name: practice.name,

        count: 1,
      });
    }
  }

  return Array.from(
    map.values()
  ).sort(
    (a, b) =>
      b.count - a.count
  );
}

function calculatePracticeObservations(
  entries: JournalInsightRow[],

  practiceRows: EntryPracticeRow[],

  overallAverageEnergy:
    number | null
): PracticeObservation[] {
  const entryMap = new Map<
    string,
    JournalInsightRow
  >();

  for (const entry of entries) {
    entryMap.set(entry.id, entry);
  }

  const practiceGroups =
    new Map<
      string,
      {
        id: string;
        name: string;
        entryIds: Set<string>;
      }
    >();

  for (const row of practiceRows) {
    const practice =
      Array.isArray(row.practice)
        ? row.practice[0]
        : row.practice;

    if (!practice) {
      continue;
    }

    const existing =
      practiceGroups.get(
        practice.id
      );

    if (existing) {
      existing.entryIds.add(
        row.entry_id
      );
    } else {
      practiceGroups.set(
        practice.id,
        {
          id: practice.id,

          name: practice.name,

          entryIds: new Set([
            row.entry_id,
          ]),
        }
      );
    }
  }

  const results:
    PracticeObservation[] = [];

  for (const group of Array.from(
    practiceGroups.values()
  )) {
    const practiceEntries =
      Array.from(
        group.entryIds
      )
        .map((entryId) =>
          entryMap.get(entryId)
        )
        .filter(
          (
            entry
          ): entry is JournalInsightRow =>
            entry !== undefined
        );

    if (
      practiceEntries.length === 0
    ) {
      continue;
    }

    const practiceAverageEnergy =
      calculateAverageEnergy(
        practiceEntries
      );

    let energyDifference:
      number | null = null;

    if (
      practiceAverageEnergy !==
        null &&
      overallAverageEnergy !== null
    ) {
      energyDifference = Number(
        (
          practiceAverageEnergy -
          overallAverageEnergy
        ).toFixed(1)
      );
    }

    results.push({
      practiceId: group.id,

      practiceName: group.name,

      timesRecorded:
        practiceEntries.length,

      averageEnergy:
        practiceAverageEnergy,

      mostCommonMood:
        getMostCommonMood(
          practiceEntries
        ),

      energyDifferenceFromOverall:
        energyDifference,
    });
  }

  return results.sort(
    (a, b) =>
      b.timesRecorded -
      a.timesRecorded
  );
}

function buildObservations(
  totalEntries: number,

  averageEnergy: number | null,

  mostCommonMood: string | null,

  sevenDayTrend: TrendPeriod,

  thirtyDayTrend: TrendPeriod,

  practiceObservations:
    PracticeObservation[],

  dreamCount: number,

  synchronicityCount: number
) {
  const observations:
    string[] = [];

  if (totalEntries === 0) {
    return [
      "Your patterns will begin appearing as you record more reflections.",
    ];
  }

  if (mostCommonMood) {
    observations.push(
      `${mostCommonMood} is your most frequently recorded mood overall.`
    );
  }

  if (averageEnergy !== null) {
    observations.push(
      `Your overall recorded average energy is ${averageEnergy} out of 5.`
    );
  }

  if (
    sevenDayTrend.averageEnergy !==
      null &&
    thirtyDayTrend.averageEnergy !==
      null
  ) {
    const difference = Number(
      (
        sevenDayTrend.averageEnergy -
        thirtyDayTrend.averageEnergy
      ).toFixed(1)
    );

    if (difference >= 0.3) {
      observations.push(
        `Your 7-day recorded energy average is ${Math.abs(
          difference
        ).toFixed(
          1
        )} points higher than your 30-day average.`
      );
    } else if (
      difference <= -0.3
    ) {
      observations.push(
        `Your 7-day recorded energy average is ${Math.abs(
          difference
        ).toFixed(
          1
        )} points lower than your 30-day average.`
      );
    } else {
      observations.push(
        "Your 7-day and 30-day recorded energy averages are fairly similar."
      );
    }
  }

  const strongestPractice =
    practiceObservations.find(
      (practice) =>
        practice.timesRecorded >=
          2 &&
        practice.averageEnergy !==
          null
    );

  if (strongestPractice) {
    let practiceText =
      `${strongestPractice.practiceName} appears in ${strongestPractice.timesRecorded} recorded reflections`;

    if (
      strongestPractice.averageEnergy !==
      null
    ) {
      practiceText += `, with an average recorded energy of ${strongestPractice.averageEnergy}/5`;
    }

    if (
      strongestPractice.mostCommonMood
    ) {
      practiceText += ` and ${strongestPractice.mostCommonMood} as the most frequently recorded mood on those entries`;
    }

    practiceText += ".";

    observations.push(
      practiceText
    );
  }

  if (
    dreamCount > 0 ||
    synchronicityCount > 0
  ) {
    observations.push(
      `You have recorded ${dreamCount} ${
        dreamCount === 1
          ? "dream"
          : "dreams"
      } and ${synchronicityCount} ${
        synchronicityCount === 1
          ? "synchronicity"
          : "synchronicities"
      }.`
    );
  }

  return observations.slice(
    0,
    6
  );
}

export async function getSoulPathInsights(): Promise<SoulPathInsights> {
  const [
    journalResponse,

    practiceResponse,

    dreamResponse,

    synchronicityResponse,
  ] = await Promise.all([
    supabase
      .from("journal_entries")

      .select(
        `
          id,
          mood,
          energy_level,
          entry_date,
          created_at
        `
      )

      .order(
        "entry_date",
        {
          ascending: false,
        }
      ),

    supabase
      .from("entry_practices")

      .select(
        `
          entry_id,
          practice_id,
          practice:practices (
            id,
            name
          )
        `
      ),

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

  if (practiceResponse.error) {
    throw practiceResponse.error;
  }

  if (dreamResponse.error) {
    throw dreamResponse.error;
  }

  if (
    synchronicityResponse.error
  ) {
    throw synchronicityResponse.error;
  }

  const entries =
    (journalResponse.data ??
      []) as JournalInsightRow[];

  const practiceRows =
    (practiceResponse.data ??
      []) as unknown as EntryPracticeRow[];

  const averageEnergy =
    calculateAverageEnergy(
      entries
    );

  const moodDistribution =
    calculateMoodDistribution(
      entries
    );

  const energyDistribution =
    calculateEnergyDistribution(
      entries
    );

  const practiceUsage =
    calculatePracticeUsage(
      practiceRows
    );

  const sevenDayTrend =
    calculateTrend(
      entries,
      7
    );

  const thirtyDayTrend =
    calculateTrend(
      entries,
      30
    );

  const practiceObservations =
    calculatePracticeObservations(
      entries,

      practiceRows,

      averageEnergy
    );

  const dreamCount =
    dreamResponse.count ?? 0;

  const synchronicityCount =
    synchronicityResponse.count ??
    0;

  const mostCommonMood =
    moodDistribution[0]?.mood ??
    null;

  const observations =
    buildObservations(
      entries.length,

      averageEnergy,

      mostCommonMood,

      sevenDayTrend,

      thirtyDayTrend,

      practiceObservations,

      dreamCount,

      synchronicityCount
    );

  return {
    totalEntries:
      entries.length,

    averageEnergy,

    mostCommonMood,

    moodDistribution,

    energyDistribution,

    practiceUsage,

    mostUsedPractice:
      practiceUsage[0] ?? null,

    dreamCount,

    synchronicityCount,

    sevenDayTrend,

    thirtyDayTrend,

    practiceObservations,

    observations,
  };
} 
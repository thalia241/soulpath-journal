import {
  supabase,
} from "../lib/supabase";

import {
  getStartDateForDays,
} from "../utils/date";

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

  averageEnergy:
    | number
    | null;

  mostCommonMood:
    | string
    | null;

  moodDistribution:
    MoodInsight[];
};

export type PracticeObservation = {
  practiceId: string;

  practiceName: string;

  timesRecorded: number;

  averageEnergy:
    | number
    | null;

  mostCommonMood:
    | string
    | null;

  energyDifferenceFromOverall:
    | number
    | null;
};

export type SoulPathInsights = {
  totalEntries: number;

  averageEnergy:
    | number
    | null;

  mostCommonMood:
    | string
    | null;

  moodDistribution:
    MoodInsight[];

  energyDistribution:
    EnergyInsight[];

  practiceUsage:
    PracticeInsight[];

  mostUsedPractice:
    | PracticeInsight
    | null;

  dreamCount: number;

  synchronicityCount: number;

  sevenDayTrend:
    TrendPeriod;

  thirtyDayTrend:
    TrendPeriod;

  practiceObservations:
    PracticeObservation[];

  observations: string[];
};

type InsightJournalEntry = {
  id: string;

  mood:
    | string
    | null;

  energy_level:
    | number
    | null;

  entry_date: string;

  created_at: string;
};

type EntryPracticeRow = {
  entry_id: string;

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

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error ===
      "object" &&
    error !== null &&
    "message" in error
  ) {
    const message =
      (
        error as {
          message?: unknown;
        }
      ).message;

    if (
      typeof message ===
      "string"
    ) {
      return message;
    }
  }

  return fallback;
}

async function requireUser() {
  const {
    data: {
      user,
    },
    error,
  } =
    await supabase.auth.getUser();

  if (
    error ||
    !user
  ) {
    throw new Error(
      "Your SoulPath session has expired. Please sign in again."
    );
  }

  return user;
}

function roundOne(
  value: number
): number {
  return Math.round(
    value * 10
  ) / 10;
}

function calculateAverageEnergy(
  entries: InsightJournalEntry[]
): number | null {
  const values =
    entries
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

  if (
    values.length === 0
  ) {
    return null;
  }

  const total =
    values.reduce(
      (
        sum,
        value
      ) =>
        sum + value,
      0
    );

  return roundOne(
    total /
      values.length
  );
}

function calculateMoodDistribution(
  entries: InsightJournalEntry[]
): MoodInsight[] {
  const counts =
    new Map<
      string,
      number
    >();

  for (
    const entry of entries
  ) {
    const mood =
      entry.mood?.trim();

    if (!mood) {
      continue;
    }

    counts.set(
      mood,
      (
        counts.get(
          mood
        ) ?? 0
      ) + 1
    );
  }

  return Array.from(
    counts.entries()
  )
    .map(
      ([
        mood,
        count,
      ]) => ({
        mood,
        count,
      })
    )
    .sort(
      (a, b) => {
        if (
          b.count !==
          a.count
        ) {
          return (
            b.count -
            a.count
          );
        }

        return a.mood.localeCompare(
          b.mood
        );
      }
    );
}

function calculateMostCommonMood(
  entries: InsightJournalEntry[]
): string | null {
  const distribution =
    calculateMoodDistribution(
      entries
    );

  return (
    distribution[0]
      ?.mood ?? null
  );
}

function calculateEnergyDistribution(
  entries: InsightJournalEntry[]
): EnergyInsight[] {
  const counts =
    new Map<
      number,
      number
    >();

  for (
    let level = 1;
    level <= 5;
    level++
  ) {
    counts.set(
      level,
      0
    );
  }

  for (
    const entry of entries
  ) {
    if (
      entry.energy_level ===
      null
    ) {
      continue;
    }

    counts.set(
      entry.energy_level,
      (
        counts.get(
          entry.energy_level
        ) ?? 0
      ) + 1
    );
  }

  return Array.from(
    counts.entries()
  ).map(
    ([
      level,
      count,
    ]) => ({
      level,
      count,
    })
  );
}

function createTrend(
  entries: InsightJournalEntry[],
  days: number
): TrendPeriod {
  const startDate =
    getStartDateForDays(
      days
    );

  /*
   * entry_date is YYYY-MM-DD.
   *
   * Because the format sorts lexicographically in the
   * same order as calendar dates, we can compare strings
   * safely without converting back through UTC.
   */
  const filtered =
    entries.filter(
      (entry) =>
        entry.entry_date >=
        startDate
    );

  return {
    days,

    entryCount:
      filtered.length,

    averageEnergy:
      calculateAverageEnergy(
        filtered
      ),

    mostCommonMood:
      calculateMostCommonMood(
        filtered
      ),

    moodDistribution:
      calculateMoodDistribution(
        filtered
      ),
  };
}

function getPracticeFromRelation(
  relation:
    | EntryPracticeRow["practice"]
): {
  id: string;
  name: string;
} | null {
  if (!relation) {
    return null;
  }

  if (
    Array.isArray(
      relation
    )
  ) {
    return (
      relation[0] ??
      null
    );
  }

  return relation;
}

function buildObservations(
  insights: Omit<
    SoulPathInsights,
    "observations"
  >
): string[] {
  const observations:
    string[] = [];

  if (
    insights.mostCommonMood
  ) {
    observations.push(
      `${insights.mostCommonMood} is the mood you've recorded most often so far.`
    );
  }

  if (
    insights.averageEnergy !==
    null
  ) {
    observations.push(
      `Across entries with an energy rating, your recorded average is ${insights.averageEnergy}/5.`
    );
  }

  const sevenEnergy =
    insights
      .sevenDayTrend
      .averageEnergy;

  const thirtyEnergy =
    insights
      .thirtyDayTrend
      .averageEnergy;

  if (
    sevenEnergy !==
      null &&
    thirtyEnergy !==
      null
  ) {
    const difference =
      roundOne(
        sevenEnergy -
          thirtyEnergy
      );

    if (
      difference >= 0.3
    ) {
      observations.push(
        `Your recorded energy over the last 7 days is ${difference.toFixed(
          1
        )} points higher than your 30-day recorded average.`
      );
    } else if (
      difference <=
      -0.3
    ) {
      observations.push(
        `Your recorded energy over the last 7 days is ${Math.abs(
          difference
        ).toFixed(
          1
        )} points lower than your 30-day recorded average.`
      );
    } else {
      observations.push(
        "Your 7-day and 30-day recorded energy averages are fairly similar."
      );
    }
  }

  const topPractice =
    insights
      .practiceObservations[0];

  if (
    topPractice &&
    topPractice.timesRecorded >=
      2
  ) {
    if (
      topPractice.averageEnergy !==
        null &&
      topPractice.mostCommonMood
    ) {
      observations.push(
        `${topPractice.practiceName} appears in ${topPractice.timesRecorded} reflections. On those entries, recorded energy averaged ${topPractice.averageEnergy}/5 and ${topPractice.mostCommonMood} appeared most often.`
      );
    } else {
      observations.push(
        `${topPractice.practiceName} is one of the practices you've recorded most often.`
      );
    }
  }

  if (
    insights.dreamCount >
      0 ||
    insights.synchronicityCount >
      0
  ) {
    observations.push(
      `You've recorded ${insights.dreamCount} ${
        insights.dreamCount ===
        1
          ? "dream"
          : "dreams"
      } and ${insights.synchronicityCount} ${
        insights.synchronicityCount ===
        1
          ? "synchronicity"
          : "synchronicities"
      }.`
    );
  }

  if (
    observations.length ===
    0
  ) {
    observations.push(
      "As you record more reflections, moods, energy, and practices, gentle patterns will begin to appear here."
    );
  }

  return observations.slice(
    0,
    6
  );
}

export async function getSoulPathInsights(): Promise<SoulPathInsights> {
  const user =
    await requireUser();

  const [
    entriesResponse,
    practiceResponse,
    dreamResponse,
    synchronicityResponse,
  ] =
    await Promise.all([
      supabase
        .from(
          "journal_entries"
        )
        .select(
          `
            id,
            mood,
            energy_level,
            entry_date,
            created_at
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "entry_date",
          {
            ascending: false,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        ),

      supabase
        .from(
          "entry_practices"
        )
        .select(
          `
            entry_id,
            practice_id,
            practice:practices (
              id,
              name
            )
          `
        )
        .eq(
          "user_id",
          user.id
        ),

      supabase
        .from(
          "experiences"
        )
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "experience_type",
          "dream"
        ),

      supabase
        .from(
          "experiences"
        )
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "experience_type",
          "synchronicity"
        ),
    ]);

  if (
    entriesResponse.error
  ) {
    throw new Error(
      getErrorMessage(
        entriesResponse.error,
        "Unable to read your reflection history."
      )
    );
  }

  if (
    practiceResponse.error
  ) {
    throw new Error(
      getErrorMessage(
        practiceResponse.error,
        "Unable to read your practice history."
      )
    );
  }

  if (
    dreamResponse.error
  ) {
    throw new Error(
      getErrorMessage(
        dreamResponse.error,
        "Unable to count your dreams."
      )
    );
  }

  if (
    synchronicityResponse.error
  ) {
    throw new Error(
      getErrorMessage(
        synchronicityResponse.error,
        "Unable to count your synchronicities."
      )
    );
  }

  const entries =
    (
      entriesResponse.data ??
      []
    ) as InsightJournalEntry[];

  const practiceRows =
    (
      practiceResponse.data ??
      []
    ) as unknown as EntryPracticeRow[];

  const entryMap =
    new Map<
      string,
      InsightJournalEntry
    >();

  for (
    const entry of entries
  ) {
    entryMap.set(
      entry.id,
      entry
    );
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

  for (
    const row of
    practiceRows
  ) {
    const practice =
      getPracticeFromRelation(
        row.practice
      );

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

      continue;
    }

    practiceGroups.set(
      practice.id,
      {
        id:
          practice.id,

        name:
          practice.name,

        entryIds:
          new Set([
            row.entry_id,
          ]),
      }
    );
  }

  const practiceUsage =
    Array.from(
      practiceGroups.values()
    )
      .map(
        (group) => ({
          id:
            group.id,

          name:
            group.name,

          count:
            group.entryIds
              .size,
        })
      )
      .sort(
        (a, b) => {
          if (
            b.count !==
            a.count
          ) {
            return (
              b.count -
              a.count
            );
          }

          return a.name.localeCompare(
            b.name
          );
        }
      );

  const overallAverageEnergy =
    calculateAverageEnergy(
      entries
    );

  const practiceObservations =
    Array.from(
      practiceGroups.values()
    )
      .map(
        (
          group
        ): PracticeObservation => {
          const practiceEntries =
            Array.from(
              group.entryIds
            )
              .map(
                (entryId) =>
                  entryMap.get(
                    entryId
                  )
              )
              .filter(
                (
                  entry
                ): entry is InsightJournalEntry =>
                  Boolean(entry)
              );

          const averageEnergy =
            calculateAverageEnergy(
              practiceEntries
            );

          let energyDifferenceFromOverall:
            | number
            | null = null;

          if (
            averageEnergy !==
              null &&
            overallAverageEnergy !==
              null
          ) {
            energyDifferenceFromOverall =
              roundOne(
                averageEnergy -
                  overallAverageEnergy
              );
          }

          return {
            practiceId:
              group.id,

            practiceName:
              group.name,

            timesRecorded:
              practiceEntries.length,

            averageEnergy,

            mostCommonMood:
              calculateMostCommonMood(
                practiceEntries
              ),

            energyDifferenceFromOverall,
          };
        }
      )
      .sort(
        (a, b) => {
          if (
            b.timesRecorded !==
            a.timesRecorded
          ) {
            return (
              b.timesRecorded -
              a.timesRecorded
            );
          }

          return a.practiceName.localeCompare(
            b.practiceName
          );
        }
      );

  const baseInsights: Omit<
    SoulPathInsights,
    "observations"
  > = {
    totalEntries:
      entries.length,

    averageEnergy:
      overallAverageEnergy,

    mostCommonMood:
      calculateMostCommonMood(
        entries
      ),

    moodDistribution:
      calculateMoodDistribution(
        entries
      ),

    energyDistribution:
      calculateEnergyDistribution(
        entries
      ),

    practiceUsage,

    mostUsedPractice:
      practiceUsage[0] ??
      null,

    dreamCount:
      dreamResponse.count ??
      0,

    synchronicityCount:
      synchronicityResponse.count ??
      0,

    sevenDayTrend:
      createTrend(
        entries,
        7
      ),

    thirtyDayTrend:
      createTrend(
        entries,
        30
      ),

    practiceObservations,
  };

  return {
    ...baseInsights,

    observations:
      buildObservations(
        baseInsights
      ),
  };
} 
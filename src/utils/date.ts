export function getLocalDateString(
  date: Date = new Date()
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalToday(): string {
  return getLocalDateString(
    new Date()
  );
}

export function parseLocalDate(
  dateString: string
): Date {
  const [
    year,
    month,
    day,
  ] =
    dateString
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day,
    0,
    0,
    0,
    0
  );
}

export function formatLocalDate(
  dateString: string
): string {
  const date =
    parseLocalDate(
      dateString
    );

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

export function formatDateTime(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

export function getStartDateForDays(
  days: number
): string {
  const safeDays =
    Math.max(
      1,
      Math.floor(days)
    );

  const start =
    new Date();

  start.setHours(
    0,
    0,
    0,
    0
  );

  start.setDate(
    start.getDate() -
      (safeDays - 1)
  );

  return getLocalDateString(
    start
  );
}

export function isWithinLastDays(
  dateString: string,
  days: number
): boolean {
  const entryDate =
    parseLocalDate(
      dateString
    );

  const startDate =
    parseLocalDate(
      getStartDateForDays(
        days
      )
    );

  return (
    entryDate.getTime() >=
    startDate.getTime()
  );
}

export function getConsecutiveDateStreak(
  dateStrings: string[]
): number {
  if (
    dateStrings.length === 0
  ) {
    return 0;
  }

  const uniqueDates =
    Array.from(
      new Set(
        dateStrings
      )
    ).sort(
      (a, b) =>
        b.localeCompare(a)
    );

  const today =
    parseLocalDate(
      getLocalToday()
    );

  const yesterday =
    new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const newestDate =
    parseLocalDate(
      uniqueDates[0]
    );

  const newestTime =
    newestDate.getTime();

  const todayTime =
    today.getTime();

  const yesterdayTime =
    yesterday.getTime();

  if (
    newestTime !==
      todayTime &&
    newestTime !==
      yesterdayTime
  ) {
    return 0;
  }

  let streak = 1;

  let previousDate =
    newestDate;

  for (
    let index = 1;
    index <
    uniqueDates.length;
    index++
  ) {
    const currentDate =
      parseLocalDate(
        uniqueDates[index]
      );

    const expected =
      new Date(
        previousDate
      );

    expected.setDate(
      expected.getDate() -
        1
    );

    if (
      currentDate.getTime() !==
      expected.getTime()
    ) {
      break;
    }

    streak++;

    previousDate =
      currentDate;
  }

  return streak;
} 
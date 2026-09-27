export function formatMetric(value, suffix = "") {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number" && Number.isNaN(value)) return "—";
  return `${value}${suffix}`;
}

export function cleanStyleName(name) {
  return String(name).replace(/ (Player|Specialist)$/, "");
}

export function topStyle(style) {
  const entries = Object.entries(style || {}).filter(
    ([, value]) => typeof value === "number" && !Number.isNaN(value)
  );

  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  return { name: cleanStyleName(entries[0][0]), score: entries[0][1] };
}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function planByDay(items) {
  const days = WEEKDAYS.map((day) => ({ day, items: [] }));

  (items || []).forEach((item, index) => {
    days[index % days.length].items.push(item);
  });

  return days.filter((entry) => entry.items.length > 0);
}

export type InstructorIdentity = {
  firstName?: string | null;
  lastName?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

export function displayName(principal?: InstructorIdentity) {
  const firstName = (principal?.firstName || principal?.first_name || "").trim();
  const lastName = (principal?.lastName || principal?.last_name || "").trim();
  return [firstName, lastName].filter(Boolean).join(" ") || "Instructor";
}

export function firstNameForGreeting(name: string) {
  return name.trim().split(/\s+/)[0] || "Instructor";
}

const IST_HOUR_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  hourCycle: "h23",
});

export function timeGreeting(date: Date) {
  const hour = Number(
    IST_HOUR_FORMATTER.formatToParts(date).find((part) => part.type === "hour")?.value,
  );
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
}
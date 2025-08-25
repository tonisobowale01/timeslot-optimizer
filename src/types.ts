export type Weekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface EventItem {
  label: string;
  start: string;
  end: string;
  days: Weekday[];
}

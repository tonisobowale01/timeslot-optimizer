export type Weekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface EventItem {
  id: number,
  label: string;
  color: string;
  start: string;
  end: string;
  days: Weekday[];
}

// Mock data for the dashboard UI. Replace with real API data once the
// call pipeline and persistence layer exist. All values are static so the
// page prerenders deterministically (no Date/random at render time).

export type Trend = "up" | "down";

export interface Kpi {
  key: string;
  label: string;
  value: string;
  delta: number; // percent change vs previous period
  goodWhen: Trend; // which direction counts as good
  spark: number[];
}

export const kpis: Kpi[] = [
  { key: "calls", label: "Total calls", value: "1,284", delta: 12.4, goodWhen: "up", spark: [82, 90, 76, 104, 98, 120, 132] },
  { key: "avg", label: "Avg call time", value: "3m 42s", delta: -3.1, goodWhen: "down", spark: [240, 232, 250, 228, 236, 224, 222] },
  { key: "answer", label: "Answer rate", value: "98.2%", delta: 1.1, goodWhen: "up", spark: [95, 96, 94, 97, 98, 98, 98.2] },
  { key: "booked", label: "Appointments booked", value: "342", delta: 18.0, goodWhen: "up", spark: [28, 34, 30, 40, 44, 52, 58] },
];

export interface Bar {
  label: string;
  value: number;
}

export const callVolume: Bar[] = [
  { label: "12", value: 62 }, { label: "13", value: 78 }, { label: "14", value: 54 }, { label: "15", value: 88 },
  { label: "16", value: 96 }, { label: "17", value: 72 }, { label: "18", value: 40 }, { label: "19", value: 104 },
  { label: "20", value: 120 }, { label: "21", value: 98 }, { label: "22", value: 110 }, { label: "23", value: 84 },
  { label: "24", value: 128 }, { label: "25", value: 132 },
];

export interface Segment {
  label: string;
  value: number;
  color: string;
}

export const talkRatio: Segment[] = [
  { label: "Caller", value: 62, color: "#7c3aed" },
  { label: "AI", value: 38, color: "#c4b5fd" },
];

export const outcomes: Segment[] = [
  { label: "Booked", value: 38, color: "#7c3aed" },
  { label: "Resolved", value: 26, color: "#10b981" },
  { label: "Message taken", value: 24, color: "#0ea5e9" },
  { label: "Transferred", value: 12, color: "#f59e0b" },
];

export interface Latency {
  medianMs: number;
  p95Ms: number;
  targetMs: number;
  spark: number[];
}

export const latency: Latency = { medianMs: 720, p95Ms: 940, targetMs: 800, spark: [760, 740, 712, 728, 700, 734, 720] };

export interface MonthUsage {
  plan: string;
  callsUsed: number;
  callsLimit: number;
  minutes: number;
  bookings: number;
}

export const monthUsage: MonthUsage = { plan: "Pro", callsUsed: 1284, callsLimit: 2000, minutes: 4760, bookings: 342 };

export type Outcome = "Booked" | "Resolved" | "Message" | "Transferred";
export type Sentiment = "positive" | "neutral" | "negative";

export interface Call {
  id: string;
  name: string;
  number: string;
  line: string;
  duration: string;
  outcome: Outcome;
  sentiment: Sentiment;
  time: string;
}

export const recentCalls: Call[] = [
  { id: "1", name: "Sarah Whitfield", number: "+1 (415) 555-0142", line: "Work", duration: "4m 12s", outcome: "Booked", sentiment: "positive", time: "2 min ago" },
  { id: "2", name: "Unknown caller", number: "+44 20 7946 0958", line: "Organization", duration: "1m 38s", outcome: "Message", sentiment: "neutral", time: "14 min ago" },
  { id: "3", name: "Mike Donovan", number: "+1 (312) 555-0186", line: "Work", duration: "6m 02s", outcome: "Transferred", sentiment: "neutral", time: "38 min ago" },
  { id: "4", name: "Jasmine Torres", number: "+1 (646) 555-0119", line: "Personal", duration: "3m 25s", outcome: "Booked", sentiment: "positive", time: "1 hr ago" },
  { id: "5", name: "Unknown caller", number: "+49 30 901820", line: "Organization", duration: "0m 52s", outcome: "Resolved", sentiment: "negative", time: "2 hr ago" },
  { id: "6", name: "Brian Callahan", number: "+1 (702) 555-0173", line: "Work", duration: "5m 18s", outcome: "Booked", sentiment: "positive", time: "3 hr ago" },
];

export interface Summary {
  id: string;
  name: string;
  time: string;
  text: string;
  tags: string[];
}

export const callSummaries: Summary[] = [
  { id: "1", name: "Sarah Whitfield", time: "2 min ago", text: "Asked to reschedule her Thursday consultation. AI offered three slots and booked Tue 10:00 AM, then sent an SMS confirmation.", tags: ["Reschedule", "Booked"] },
  { id: "2", name: "Mike Donovan", time: "38 min ago", text: "New lead for a commercial drain inspection. AI captured the address and urgency (burst pipe), flagged high priority, and transferred to the on-call line.", tags: ["Lead", "Urgent"] },
  { id: "3", name: "Jasmine Torres", time: "1 hr ago", text: "Returning client booked a 60-minute deep-tissue appointment for Saturday and asked about gift cards — AI shared the purchase link.", tags: ["Booking", "FAQ"] },
];

export enum ChartPeriod {
  Intraday = "I",
  Daily = "D",
  Weekly = "W",
  Monthly = "M",
}

export interface TimeInterval {
  label: string;
  value: number;
  period: ChartPeriod;
}

export interface OHLCData {
  s: string;
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}
    
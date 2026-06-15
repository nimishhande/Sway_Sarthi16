import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: string; // "HH:MM" 24h
  onChange: (v: string) => void;
  placeholder?: string;
};

function to12h(value: string): { hour: string; minute: string; period: "AM" | "PM" } {
  const m = /^(\d{2}):(\d{2})/.exec(value || "");
  if (!m) return { hour: "", minute: "", period: "AM" };
  const h24 = parseInt(m[1], 10);
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { hour: String(h12).padStart(2, "0"), minute: m[2], period };
}

function to24h(hour: string, minute: string, period: "AM" | "PM"): string {
  if (!hour || !minute) return "";
  let h = parseInt(hour, 10);
  if (period === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${minute}`;
}

function format12hLabel(value: string) {
  const { hour, minute, period } = to12h(value);
  if (!hour || !minute) return "";
  return `${hour}:${minute} ${period}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export function TimeField({ value, onChange, placeholder = "Pick a time" }: Props) {
  const [open, setOpen] = React.useState(false);
  const current = to12h(value);
  const [hour, setHour] = React.useState(current.hour);
  const [minute, setMinute] = React.useState(current.minute);
  const [period, setPeriod] = React.useState<"AM" | "PM">(current.period);

  React.useEffect(() => {
    const c = to12h(value);
    setHour(c.hour);
    setMinute(c.minute);
    setPeriod(c.period);
  }, [value]);

  const commit = (h: string, m: string, p: "AM" | "PM") => {
    const next = to24h(h, m, p);
    if (next) onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground",
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? format12hLabel(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 z-50 pointer-events-auto" align="start">
        <div className="flex items-center gap-2">
          <Select
            value={hour}
            onValueChange={(v) => {
              setHour(v);
              commit(v, minute || "00", period);
            }}
          >
            <SelectTrigger className="w-20"><SelectValue placeholder="HH" /></SelectTrigger>
            <SelectContent className="max-h-60">
              {HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="font-semibold">:</span>
          <Select
            value={minute}
            onValueChange={(v) => {
              setMinute(v);
              commit(hour || "12", v, period);
            }}
          >
            <SelectTrigger className="w-20"><SelectValue placeholder="MM" /></SelectTrigger>
            <SelectContent className="max-h-60">
              {MINUTES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={period}
            onValueChange={(v) => {
              const p = v as "AM" | "PM";
              setPeriod(p);
              commit(hour || "12", minute || "00", p);
            }}
          >
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="button" size="sm" onClick={() => setOpen(false)}>Done</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

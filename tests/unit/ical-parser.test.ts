import { describe, it, expect } from "vitest";
import {
  parseBlocks,
  toDateOnly,
  addOneDay,
  parameterValueToString,
} from "@/lib/ical/parser";

/**
 * Unit tests del parser iCal — sin DB, sin red. Verifican casos críticos
 * que se ven en feeds reales de Booking / Airbnb.
 */

const SAMPLE_ICS = `BEGIN:VCALENDAR
PRODID:-//Test//EN
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:CLOSED - Not available
DTSTART;VALUE=DATE:20260601
DTEND;VALUE=DATE:20260604
UID:booking-001@booking
DESCRIPTION:Reserva externa
END:VEVENT
BEGIN:VEVENT
SUMMARY:CLOSED - Not available
DTSTART;VALUE=DATE:20260610
DTEND;VALUE=DATE:20260612
UID:airbnb-002@airbnb
END:VEVENT
BEGIN:VEVENT
SUMMARY:Cancelado
DTSTART;VALUE=DATE:20260620
DTEND;VALUE=DATE:20260621
UID:cancelled-003@booking
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR`;

describe("parseBlocks", () => {
  it("parses all-day VEVENTs with VALUE=DATE", async () => {
    const blocks = await parseBlocks(SAMPLE_ICS);
    // 3 VEVENTs en el feed, 1 cancelado → 2 bloques esperados.
    expect(blocks).toHaveLength(2);
  });

  it("filters out CANCELLED events", async () => {
    const blocks = await parseBlocks(SAMPLE_ICS);
    expect(blocks.find((b) => b.uid.includes("cancelled"))).toBeUndefined();
  });

  it("returns dates as YYYY-MM-DD (UTC)", async () => {
    const blocks = await parseBlocks(SAMPLE_ICS);
    const booking = blocks.find((b) => b.uid === "booking-001@booking");
    expect(booking).toBeDefined();
    expect(booking!.start).toBe("2026-06-01");
    expect(booking!.end).toBe("2026-06-04");
  });

  it("preserves summary text", async () => {
    const blocks = await parseBlocks(SAMPLE_ICS);
    const booking = blocks.find((b) => b.uid === "booking-001@booking");
    expect(booking!.summary).toBe("CLOSED - Not available");
  });

  it("deduplicates by UID — last entry wins", async () => {
    const dupe = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:dup-1@x
SUMMARY:Primera
DTSTART;VALUE=DATE:20260101
DTEND;VALUE=DATE:20260102
END:VEVENT
BEGIN:VEVENT
UID:dup-1@x
SUMMARY:Segunda
DTSTART;VALUE=DATE:20260201
DTEND;VALUE=DATE:20260203
END:VEVENT
END:VCALENDAR`;
    const blocks = await parseBlocks(dupe);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].start).toBe("2026-02-01");
    expect(blocks[0].summary).toBe("Segunda");
  });

  it("skips events without UID or start", async () => {
    const broken = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Sin UID
DTSTART;VALUE=DATE:20260301
DTEND;VALUE=DATE:20260302
END:VEVENT
END:VCALENDAR`;
    const blocks = await parseBlocks(broken);
    expect(blocks).toHaveLength(0);
  });

  it("skips events where end <= start", async () => {
    const invalid = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:bad@x
DTSTART;VALUE=DATE:20260101
DTEND;VALUE=DATE:20260101
END:VEVENT
END:VCALENDAR`;
    const blocks = await parseBlocks(invalid);
    expect(blocks).toHaveLength(0);
  });

  it("defaults end to start+1 day when DTEND missing", async () => {
    const noEnd = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:no-end@x
DTSTART;VALUE=DATE:20260415
SUMMARY:Sin DTEND
END:VEVENT
END:VCALENDAR`;
    const blocks = await parseBlocks(noEnd);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].start).toBe("2026-04-15");
    expect(blocks[0].end).toBe("2026-04-16");
  });

  it("ignores non-VEVENT components (VTODO, VTIMEZONE)", async () => {
    const mixed = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VTIMEZONE
TZID:America/Bogota
END:VTIMEZONE
BEGIN:VTODO
UID:todo@x
SUMMARY:Una tarea
END:VTODO
BEGIN:VEVENT
UID:ev@x
DTSTART;VALUE=DATE:20260501
DTEND;VALUE=DATE:20260502
END:VEVENT
END:VCALENDAR`;
    const blocks = await parseBlocks(mixed);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].uid).toBe("ev@x");
  });

  it("returns empty array on calendar with no events", async () => {
    const empty = `BEGIN:VCALENDAR
VERSION:2.0
END:VCALENDAR`;
    expect(await parseBlocks(empty)).toHaveLength(0);
  });
});

describe("toDateOnly", () => {
  it("extracts UTC date from Date object", () => {
    expect(toDateOnly(new Date(Date.UTC(2026, 0, 15, 12, 30)))).toBe("2026-01-15");
  });

  it("pads single-digit months and days", () => {
    expect(toDateOnly(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01-05");
  });

  it("returns null for invalid Date", () => {
    expect(toDateOnly(new Date("not a date"))).toBeNull();
  });

  it("parses ISO string", () => {
    expect(toDateOnly("2026-07-04T00:00:00.000Z")).toBe("2026-07-04");
  });
});

describe("addOneDay", () => {
  it("advances date by one", () => {
    expect(addOneDay("2026-01-01")).toBe("2026-01-02");
  });

  it("handles end of month", () => {
    expect(addOneDay("2026-01-31")).toBe("2026-02-01");
  });

  it("handles end of year", () => {
    expect(addOneDay("2026-12-31")).toBe("2027-01-01");
  });

  it("handles leap year", () => {
    // 2028 es bisiesto.
    expect(addOneDay("2028-02-28")).toBe("2028-02-29");
    expect(addOneDay("2028-02-29")).toBe("2028-03-01");
  });
});

describe("parameterValueToString", () => {
  it("returns string for plain string", () => {
    expect(parameterValueToString("hello")).toBe("hello");
  });

  it("returns null for null/undefined", () => {
    expect(parameterValueToString(null)).toBeNull();
    expect(parameterValueToString(undefined)).toBeNull();
  });

  it("extracts val from parameter-tagged object", () => {
    expect(
      parameterValueToString({ val: "with params", params: { LANGUAGE: "es" } }),
    ).toBe("with params");
  });

  it("returns null for malformed object", () => {
    expect(parameterValueToString({ params: { LANGUAGE: "es" } })).toBeNull();
    expect(parameterValueToString({ val: 123 })).toBeNull();
  });
});

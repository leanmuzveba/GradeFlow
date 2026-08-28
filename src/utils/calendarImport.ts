import { EventType, PriorityLevel } from '../types';

export interface ParsedCalendarEvent {
  title: string;
  dueAt: string; // ISO string
  eventType: EventType;
  priority: PriorityLevel;
  location?: string;
  notes?: string;
}

export class CalendarImportError extends Error {}

const TITLE_KEYS = ['title', 'name', 'summary', 'event', 'subject'];
const DATE_KEYS = ['dueat', 'duedate', 'due', 'date', 'startdate', 'start', 'dtstart', 'datetime', 'when'];
const TYPE_KEYS = ['eventtype', 'type', 'category'];
const LOCATION_KEYS = ['location', 'venue', 'room', 'place'];
const NOTES_KEYS = ['notes', 'description', 'details', 'note'];
const PRIORITY_KEYS = ['priority'];

const normKey = (key: string) => key.trim().toLowerCase().replace(/[\s_-]/g, '');

function pickField(row: Record<string, unknown>, candidates: string[]): string | undefined {
  const normalizedRow: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    normalizedRow[normKey(k)] = v;
  }
  for (const candidate of candidates) {
    const val = normalizedRow[candidate];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return undefined;
}

function inferEventType(...texts: (string | undefined)[]): EventType {
  const text = texts.filter(Boolean).join(' ').toLowerCase();
  if (/\bexam|final\b/.test(text)) return 'exam';
  if (/\btest|quiz\b/.test(text)) return 'test';
  if (/\bproject\b/.test(text)) return 'project';
  if (/\bstudy|review session|revision\b/.test(text)) return 'study_event';
  return 'assignment';
}

function inferPriority(text: string | undefined): PriorityLevel {
  const t = (text || '').toLowerCase();
  if (t === 'high' || t === 'urgent') return 'high';
  if (t === 'low') return 'low';
  return 'medium';
}

function parseFlexibleDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // ICS-style: 20260828T090000Z or 20260828
  const icsMatch = trimmed.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?Z?$/);
  if (icsMatch) {
    const [, y, mo, d, h = '00', mi = '00', s = '00'] = icsMatch;
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) return dt.toISOString();
  }

  // DD/MM/YYYY or MM/DD/YYYY (assume MM/DD/YYYY, US-style, common in portal exports)
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
  if (slashMatch) {
    let [, mm, dd, yyyy, hh, min, , ampm] = slashMatch;
    if (yyyy.length === 2) yyyy = `20${yyyy}`;
    let hour = hh ? parseInt(hh, 10) : 23;
    const minute = min ? parseInt(min, 10) : 59;
    if (ampm) {
      if (/pm/i.test(ampm) && hour < 12) hour += 12;
      if (/am/i.test(ampm) && hour === 12) hour = 0;
    }
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd), hour, minute);
    if (!isNaN(dt.getTime())) return dt.toISOString();
  }

  // Fall back to native Date parsing (handles ISO 8601, "Aug 28 2026", etc.)
  const nativeParsed = new Date(trimmed);
  if (!isNaN(nativeParsed.getTime())) return nativeParsed.toISOString();

  return null;
}

function rowToEvent(row: Record<string, unknown>): ParsedCalendarEvent | null {
  const title = pickField(row, TITLE_KEYS);
  const rawDate = pickField(row, DATE_KEYS);
  if (!title || !rawDate) return null;

  const dueAt = parseFlexibleDate(rawDate);
  if (!dueAt) return null;

  const rawType = pickField(row, TYPE_KEYS);
  const location = pickField(row, LOCATION_KEYS);
  const notes = pickField(row, NOTES_KEYS);
  const rawPriority = pickField(row, PRIORITY_KEYS);

  const eventType = rawType && ['assignment', 'test', 'exam', 'project', 'study_event'].includes(rawType.toLowerCase().replace(/\s/g, '_'))
    ? (rawType.toLowerCase().replace(/\s/g, '_') as EventType)
    : inferEventType(title, rawType, notes);

  return {
    title,
    dueAt,
    eventType,
    priority: inferPriority(rawPriority),
    location,
    notes,
  };
}

// Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, commas within quotes.
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((f) => f.trim() !== '')) rows.push(row);
  }
  return rows;
}

function parseCsv(text: string): ParsedCalendarEvent[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) {
    throw new CalendarImportError('That CSV file has no data rows below the header.');
  }
  const headers = rows[0].map((h) => h.trim());
  const events: ParsedCalendarEvent[] = [];

  for (let i = 1; i < rows.length; i++) {
    const rowRecord: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      rowRecord[h] = rows[i][idx];
    });
    const parsed = rowToEvent(rowRecord);
    if (parsed) events.push(parsed);
  }

  if (events.length === 0) {
    throw new CalendarImportError(
      "Couldn't find a title and date in any row. Make sure your CSV has columns like Title/Name and Date/Due Date."
    );
  }
  return events;
}

function parseJson(text: string): ParsedCalendarEvent[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new CalendarImportError("That JSON file couldn't be parsed. Check it's valid JSON.");
  }

  const list: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { events?: unknown[] })?.events)
    ? (data as { events: unknown[] }).events
    : Array.isArray((data as { items?: unknown[] })?.items)
    ? (data as { items: unknown[] }).items
    : [];

  const events: ParsedCalendarEvent[] = [];
  for (const item of list) {
    if (item && typeof item === 'object') {
      const parsed = rowToEvent(item as Record<string, unknown>);
      if (parsed) events.push(parsed);
    }
  }

  if (events.length === 0) {
    throw new CalendarImportError(
      "Couldn't find any events with a title and date. Expected an array of objects (or an { events: [...] } wrapper) with fields like title and date."
    );
  }
  return events;
}

function unfoldIcsLines(text: string): string[] {
  const rawLines = text.split(/\r\n|\n|\r/);
  const lines: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

function parseIcs(text: string): ParsedCalendarEvent[] {
  const lines = unfoldIcsLines(text);
  const events: ParsedCalendarEvent[] = [];
  let current: Record<string, unknown> | null = null;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      current = {};
      continue;
    }
    if (line.startsWith('END:VEVENT')) {
      if (current) {
        const parsed = rowToEvent(current);
        if (parsed) events.push(parsed);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const separatorIdx = line.indexOf(':');
    if (separatorIdx === -1) continue;
    const rawKey = line.slice(0, separatorIdx).split(';')[0].trim().toUpperCase();
    const value = line.slice(separatorIdx + 1).trim().replace(/\\,/g, ',').replace(/\\n/gi, ' ');

    if (rawKey === 'SUMMARY') current['title'] = value;
    else if (rawKey === 'DTSTART') current['date'] = value;
    else if (rawKey === 'LOCATION') current['location'] = value;
    else if (rawKey === 'DESCRIPTION') current['notes'] = value;
  }

  if (events.length === 0) {
    throw new CalendarImportError("Couldn't find any VEVENT entries with a SUMMARY and DTSTART in that .ics file.");
  }
  return events;
}

export function parseCalendarFile(fileName: string, text: string): ParsedCalendarEvent[] {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'json') return parseJson(text);
  if (ext === 'ics' || ext === 'ical') return parseIcs(text);
  if (ext === 'csv') return parseCsv(text);

  // Unknown extension: sniff content
  const trimmed = text.trim();
  if (trimmed.startsWith('BEGIN:VCALENDAR')) return parseIcs(text);
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return parseJson(text);
  return parseCsv(text);
}

export interface CsvRecord {
  row: string[];
  rowNumber: number;
}

export function parseCsv(input: string): { headers: string[]; records: CsvRecord[] } {
  const rows: string[][] = [];
  let current: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      current.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      current.push(value);
      value = "";
      if (current.some((cell) => cell.trim() !== "")) rows.push(current);
      current = [];
    } else {
      value += character;
    }
  }

  if (value !== "" || current.length > 0) {
    current.push(value);
    if (current.some((cell) => cell.trim() !== "")) rows.push(current);
  }

  const headers = (rows.shift() ?? []).map((header) => header.replace(/^\uFEFF/, "").trim());
  return {
    headers,
    records: rows.map((row, index) => ({ row, rowNumber: index + 2 })),
  };
}

export function normalizedHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
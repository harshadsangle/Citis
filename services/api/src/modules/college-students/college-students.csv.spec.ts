import assert from "node:assert/strict";
import test from "node:test";
import { parseCsv } from "./college-students.csv";

test("college student CSV parser preserves quoted commas and multiline names", () => {
  const parsed = parseCsv(
    `College/University,College User ID,Student Name,Email,Phone,Password,Status
"North, College",NC-001,"Asha
Sharma",asha@example.com,,StrongPass1,Active`,
  );
  assert.equal(parsed.headers[0], "College/University");
  assert.equal(parsed.records.length, 1);
  assert.equal(parsed.records[0].row[0], "North, College");
  assert.equal(parsed.records[0].row[2], "Asha\nSharma");
});

test("college student CSV parser ignores blank records", () => {
  const parsed = parseCsv("College User ID,Student Name\n\nNC-001,Asha\n");
  assert.equal(parsed.records.length, 1);
  assert.equal(parsed.records[0].rowNumber, 2);
});
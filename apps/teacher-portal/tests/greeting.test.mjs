import assert from "node:assert/strict";
import test from "node:test";
import { displayName, firstNameForGreeting, timeGreeting } from "../app/greeting.ts";

function istTime(hour, minute = 0) {
  const localHour = String(hour).padStart(2, "0");
  const localMinute = String(minute).padStart(2, "0");
  return new Date(`2026-09-28T${localHour}:${localMinute}:00+05:30`);
}

test("morning greeting covers 5:00 AM through 11:59 AM", () => {
  assert.equal(timeGreeting(istTime(5)), "Good Morning");
  assert.equal(timeGreeting(istTime(11, 59)), "Good Morning");
});

test("afternoon greeting covers 12:00 PM through 4:59 PM", () => {
  assert.equal(timeGreeting(istTime(12)), "Good Afternoon");
  assert.equal(timeGreeting(istTime(16, 59)), "Good Afternoon");
});

test("evening greeting covers 5:00 PM through 4:59 AM", () => {
  assert.equal(timeGreeting(istTime(17)), "Good Evening");
  assert.equal(timeGreeting(istTime(23, 59)), "Good Evening");
  assert.equal(timeGreeting(istTime(0)), "Good Evening");
  assert.equal(timeGreeting(istTime(4, 59)), "Good Evening");
});

test("greeting name comes from the authenticated principal", () => {
  const name = displayName({ firstName: "Asha", lastName: "Sharma" });
  assert.equal(name, "Asha Sharma");
  assert.equal(firstNameForGreeting(name), "Asha");
});

test("principal name mapping supports the API snake-case fields", () => {
  assert.equal(displayName({ first_name: "Rahul", last_name: "Verma" }), "Rahul Verma");
});
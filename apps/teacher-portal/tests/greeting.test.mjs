import assert from "node:assert/strict";
import test from "node:test";
import { displayName, firstNameForGreeting, timeGreeting } from "../app/greeting.ts";

function localTime(hour, minute = 0) {
  return new Date(2026, 8, 28, hour, minute, 0, 0);
}

test("morning greeting covers 5:00 AM through 11:59 AM", () => {
  assert.equal(timeGreeting(localTime(5)), "Good Morning");
  assert.equal(timeGreeting(localTime(11, 59)), "Good Morning");
});

test("afternoon greeting covers 12:00 PM through 4:59 PM", () => {
  assert.equal(timeGreeting(localTime(12)), "Good Afternoon");
  assert.equal(timeGreeting(localTime(16, 59)), "Good Afternoon");
});

test("evening greeting covers 5:00 PM through 4:59 AM", () => {
  assert.equal(timeGreeting(localTime(17)), "Good Evening");
  assert.equal(timeGreeting(localTime(23, 59)), "Good Evening");
  assert.equal(timeGreeting(localTime(0)), "Good Evening");
  assert.equal(timeGreeting(localTime(4, 59)), "Good Evening");
});

test("greeting name comes from the authenticated principal", () => {
  const name = displayName({ firstName: "Asha", lastName: "Sharma" });
  assert.equal(name, "Asha Sharma");
  assert.equal(firstNameForGreeting(name), "Asha");
});

test("principal name mapping supports the API snake-case fields", () => {
  assert.equal(displayName({ first_name: "Rahul", last_name: "Verma" }), "Rahul Verma");
});
import assert from "node:assert/strict";
import test from "node:test";
import * as bcrypt from "bcryptjs";
import { PASSWORD_HASH_ROUNDS, hashPassword, verifyPassword } from "./password-security";

test("password hashing uses bcrypt with the configured work factor and a unique salt", async () => {
  const password = "Strong Test Password 123!";
  const firstHash = await hashPassword(password);
  const secondHash = await hashPassword(password);

  assert.match(firstHash, /^\$2[aby]\$12\$/);
  assert.equal(bcrypt.getRounds(firstHash), PASSWORD_HASH_ROUNDS);
  assert.notEqual(firstHash, secondHash, "bcrypt must generate a fresh salt for each password hash");
  assert.equal(await verifyPassword(password, firstHash), true);
  assert.equal(await verifyPassword("Wrong Password 123!", firstHash), false);
  assert.equal(firstHash.includes(password), false);
});
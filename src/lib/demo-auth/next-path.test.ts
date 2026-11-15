import assert from "node:assert/strict";
import { test } from "node:test";
import { authHref, safeNextPath } from "./next-path";

test("safeNextPath keeps same-site paths, including query and hash", () => {
  assert.equal(safeNextPath("/account"), "/account");
  assert.equal(safeNextPath("/account/courses/speak-up-with-confidence"), "/account/courses/speak-up-with-confidence");
  assert.equal(safeNextPath("/account/courses/x?lesson=suc-m1-l2"), "/account/courses/x?lesson=suc-m1-l2");
  assert.equal(safeNextPath("/courses#top"), "/courses#top");
});

test("safeNextPath falls back for empty, relative and off-site targets", () => {
  for (const bad of [
    null,
    undefined,
    "",
    "account",
    "https://evil.example/",
    "//evil.example/path",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "/ok\nnext",
    "/a\\b",
  ]) {
    assert.equal(safeNextPath(bad), "/account", String(bad));
  }
});

test("safeNextPath never loops back to the auth pages", () => {
  assert.equal(safeNextPath("/account/sign-in"), "/account");
  assert.equal(safeNextPath("/account/sign-up?next=/x"), "/account");
});

test("safeNextPath honours a custom fallback", () => {
  assert.equal(safeNextPath("//x", "/"), "/");
});

test("authHref only adds next when it isn't the default", () => {
  assert.equal(authHref("/account/sign-in"), "/account/sign-in");
  assert.equal(authHref("/account/sign-in", "/account"), "/account/sign-in");
  assert.equal(authHref("/account/sign-up", "/courses/x"), "/account/sign-up?next=%2Fcourses%2Fx");
  assert.equal(authHref("/account/sign-in", "//evil.example"), "/account/sign-in");
});

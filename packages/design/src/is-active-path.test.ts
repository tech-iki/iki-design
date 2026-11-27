import { describe, expect, it } from "vitest";

import { isActivePath } from "./is-active-path.js";

/**
 * `isActivePath` is the whole of "which rail link is current" (#19), so each
 * rule in its header has rows here, each with the case that would break it.
 */
describe("isActivePath", () => {
  it("matches the page itself", () => {
    expect(isActivePath("/calls", "/calls")).toBe(true);
    expect(isActivePath("/calls/42", "/calls/42")).toBe(true);
  });

  it("matches below the link, on a segment boundary", () => {
    expect(isActivePath("/calls/42", "/calls")).toBe(true);
    expect(isActivePath("/calls/42/edit", "/calls")).toBe(true);
  });

  it("never matches a sibling that shares a prefix", () => {
    expect(isActivePath("/calls-admin", "/calls")).toBe(false);
    expect(isActivePath("/calls-admin/3", "/calls")).toBe(false);
    expect(isActivePath("/tasks-archive", "/tasks")).toBe(false);
    expect(isActivePath("/callsadmin", "/calls")).toBe(false);
    expect(isActivePath("/calls", "/calls-admin")).toBe(false);
  });

  it("never matches a parent of the link", () => {
    expect(isActivePath("/calls", "/calls/42")).toBe(false);
  });

  it("treats the root as exact, or it would be current everywhere", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/calls", "/")).toBe(false);
    expect(isActivePath("/", "/calls")).toBe(false);
    expect(isActivePath("", "/")).toBe(false);
  });

  it("with exact, matches only the page itself", () => {
    expect(isActivePath("/calls", "/calls", { exact: true })).toBe(true);
    expect(isActivePath("/calls/42", "/calls", { exact: true })).toBe(false);
    expect(isActivePath("/calls/", "/calls", { exact: true })).toBe(true);
  });

  it("ignores trailing slashes on either side", () => {
    expect(isActivePath("/calls/", "/calls")).toBe(true);
    expect(isActivePath("/calls", "/calls/")).toBe(true);
    expect(isActivePath("/calls//", "/calls")).toBe(true);
    expect(isActivePath("/calls/42/", "/calls/")).toBe(true);
    expect(isActivePath("/calls-admin/", "/calls/")).toBe(false);
  });

  it("ignores the query and the hash on either side", () => {
    expect(isActivePath("/calls?page=2", "/calls")).toBe(true);
    expect(isActivePath("/calls#open", "/calls")).toBe(true);
    expect(isActivePath("/calls/?page=2#top", "/calls")).toBe(true);
    expect(isActivePath("/calls", "/calls?view=late")).toBe(true);
    expect(isActivePath("/?q=x", "/")).toBe(true);
    expect(isActivePath("/calls?next=/admin", "/admin")).toBe(false);
    expect(isActivePath("/calls#/admin", "/admin")).toBe(false);
  });

  it("gives up the state on an excluded child, and on what is below it", () => {
    const exclude = ["/tasks/summary"];
    expect(isActivePath("/tasks", "/tasks", { exclude })).toBe(true);
    expect(isActivePath("/tasks/42", "/tasks", { exclude })).toBe(true);
    expect(isActivePath("/tasks/summary", "/tasks", { exclude })).toBe(false);
    expect(isActivePath("/tasks/summary/2026", "/tasks", { exclude })).toBe(false);
    expect(isActivePath("/tasks/summary/", "/tasks", { exclude })).toBe(false);
    // The excluded child's own sibling prefix is still the parent's.
    expect(isActivePath("/tasks/summary-old", "/tasks", { exclude })).toBe(true);
  });

  it("lets the child itself be current where the parent is not", () => {
    expect(isActivePath("/tasks/summary", "/tasks/summary")).toBe(true);
    expect(isActivePath("/people/me", "/people", { exclude: ["/people/me"] })).toBe(false);
    expect(isActivePath("/people/me", "/people/me")).toBe(true);
  });

  it("never matches an href that is not a rooted path", () => {
    expect(isActivePath("/calls", "calls")).toBe(false);
    expect(isActivePath("/calls", "")).toBe(false);
    expect(isActivePath("/calls", "https://example.org/calls")).toBe(false);
    expect(isActivePath("/calls", "//example.org/calls")).toBe(false);
    expect(isActivePath("/", "mailto:help@example.org")).toBe(false);
    expect(isActivePath("/calls", "#main-content")).toBe(false);
    expect(isActivePath("calls", "/calls")).toBe(false);
  });

  it("is case-sensitive, as paths are", () => {
    expect(isActivePath("/Calls", "/calls")).toBe(false);
  });

  it("ignores an exclusion that is not a path", () => {
    expect(isActivePath("/tasks/x", "/tasks", { exclude: ["", "x", "https://a.test/tasks/x"] })).toBe(true);
  });
});

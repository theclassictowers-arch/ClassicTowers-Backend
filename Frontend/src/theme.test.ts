import { describe, expect, it } from "vitest";
import {
  DEFAULT_DASHBOARD_THEME,
  normalizeAppFont,
  normalizeDashboardTheme,
} from "./theme-utils";

describe("normalizeDashboardTheme", () => {
  it("uses defaults for missing colors", () => {
    expect(normalizeDashboardTheme({})).toEqual(DEFAULT_DASHBOARD_THEME);
  });

  it("normalizes valid theme colors", () => {
    expect(
      normalizeDashboardTheme({
        primaryColor: "#ABCDEF",
        backgroundColor: "#123456",
        textColor: "#FEDCBA",
      })
    ).toEqual({
      primaryColor: "#abcdef",
      backgroundColor: "#123456",
      textColor: "#fedcba",
    });
  });

  it("falls back when a color is invalid", () => {
    expect(
      normalizeDashboardTheme({
        primaryColor: "blue",
        backgroundColor: "#123456",
        textColor: "#fedcba",
      })
    ).toEqual({
      ...DEFAULT_DASHBOARD_THEME,
      backgroundColor: "#123456",
      textColor: "#fedcba",
    });
  });
});

describe("normalizeAppFont", () => {
  it("keeps known app fonts", () => {
    expect(normalizeAppFont("\"Verdana\", \"Arial\", sans-serif")).toBe(
      "\"Verdana\", \"Arial\", sans-serif"
    );
  });

  it("falls back for unknown fonts", () => {
    expect(normalizeAppFont("Comic Sans MS")).toBe(
      "\"Arial\", \"Helvetica\", sans-serif"
    );
  });
});

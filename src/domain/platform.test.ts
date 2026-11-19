import { describe, expect, it } from "vitest";
import { detectInstallPlatform } from "./platform";

describe("detectInstallPlatform", () => {
  it("prioritizes standalone display mode regardless of user agent", () => {
    expect(
      detectInstallPlatform({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
        isStandalone: true,
      }),
    ).toBe("standalone");
  });

  it("detects iOS Safari and Android Chrome user agents", () => {
    expect(
      detectInstallPlatform({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
        isStandalone: false,
      }),
    ).toBe("ios");
    expect(
      detectInstallPlatform({
        userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/130.0.0.0 Mobile",
        isStandalone: false,
      }),
    ).toBe("android");
  });

  it("defaults unknown desktop user agents to iOS guide", () => {
    expect(
      detectInstallPlatform({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        isStandalone: false,
      }),
    ).toBe("ios");
  });
});

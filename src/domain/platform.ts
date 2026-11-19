export type InstallPlatform = "ios" | "android" | "standalone";

export function detectInstallPlatform(input: {
  readonly userAgent: string;
  readonly isStandalone: boolean;
}): InstallPlatform {
  if (input.isStandalone) return "standalone";
  if (/iphone|ipad|ipod/i.test(input.userAgent)) return "ios";
  if (/android/i.test(input.userAgent)) return "android";
  return "ios";
}

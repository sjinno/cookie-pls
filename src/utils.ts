type SameSite = "no_restriction" | "lax" | "strict" | "unspecified";

export function convertSameSite(samesite: number): SameSite {
  switch (samesite) {
    case 0:
      return "no_restriction";
    case 1:
      return "lax";
    case 2:
      return "strict";
    default:
      return "unspecified";
  }
}

import { StyleSheet } from "@react-pdf/renderer";

// Font registration is done in register-fonts.ts (must be imported before rendering)

// ==================== Color Palette ====================
export const colors = {
  primary: "#1B4D3E",
  primaryLight: "#2D6B55",
  accent: "#10B981",
  accentLight: "#D1FAE5",
  text: "#1a1a1a",
  textSecondary: "#374151",
  muted: "#6b7280",
  mutedLight: "#9ca3af",
  bg: "#f9fafb",
  bgCard: "#ffffff",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  white: "#ffffff",
  success: "#059669",
  warning: "#d97706",
  info: "#2563eb",
} as const;

// ==================== Font Sizes ====================
export const fontSizes = {
  h1: 28,
  h2: 20,
  h3: 16,
  h4: 13,
  body: 10,
  bodySmall: 9,
  small: 8,
  tiny: 7,
} as const;

const FONT = "Open Sans";

// ==================== Shared Styles ====================
export const styles = StyleSheet.create({
  // ---- Page ----
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontFamily: FONT,
    fontSize: fontSizes.body,
    color: colors.text,
    backgroundColor: colors.white,
  },

  pageWithFooter: {
    paddingTop: 50,
    paddingBottom: 70,
    paddingHorizontal: 40,
    fontFamily: FONT,
    fontSize: fontSizes.body,
    color: colors.text,
    backgroundColor: colors.white,
  },

  // Page used for chapters: extra top padding for the fixed compact header
  pageChapter: {
    paddingTop: 90,
    paddingBottom: 70,
    paddingHorizontal: 40,
    fontFamily: FONT,
    fontSize: fontSizes.body,
    color: colors.text,
    backgroundColor: colors.white,
  },

  // ---- Typography ----
  h1: {
    fontSize: fontSizes.h1,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 12,
    lineHeight: 1.2,
  },

  h2: {
    fontSize: fontSizes.h2,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 10,
    lineHeight: 1.3,
  },

  h3: {
    fontSize: fontSizes.h3,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primaryLight,
    marginBottom: 8,
    lineHeight: 1.3,
  },

  h4: {
    fontSize: fontSizes.h4,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 1.3,
  },

  body: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    color: colors.text,
    lineHeight: 1.6,
  },

  bodyMuted: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    color: colors.muted,
    lineHeight: 1.6,
  },

  small: {
    fontSize: fontSizes.small,
    fontFamily: FONT,
    color: colors.muted,
    lineHeight: 1.4,
  },

  bold: {
    fontWeight: 700,
  },

  italic: {
    fontStyle: "italic",
  },

  // ---- Section Title ----
  sectionTitle: {
    fontSize: fontSizes.h2,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },

  sectionSubtitle: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    fontStyle: "italic",
    color: colors.muted,
    marginBottom: 16,
    lineHeight: 1.5,
  },

  // ---- Rule Card ----
  ruleCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },

  ruleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  ruleName: {
    fontSize: fontSizes.h4,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primary,
    flex: 1,
    marginRight: 8,
    lineHeight: 1.3,
  },

  ruleDescription: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    color: colors.textSecondary,
    lineHeight: 1.5,
    marginTop: 2,
    marginBottom: 6,
  },

  // ---- Amount ----
  amount: {
    fontSize: 14,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.accent,
  },

  amountLabel: {
    fontSize: fontSizes.tiny,
    fontFamily: FONT,
    color: colors.muted,
    textTransform: "uppercase",
  },

  amountContainer: {
    alignItems: "flex-end",
    minWidth: 70,
  },

  // ---- Badge / Tag ----
  tag: {
    fontSize: fontSizes.tiny,
    fontFamily: FONT,
    color: colors.primary,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 3,
    marginBottom: 3,
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },

  certaintyBadge: {
    fontSize: fontSizes.small,
    fontFamily: FONT,
    fontWeight: 600,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 3,
  },

  certoCertain: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },

  certoProbabile: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },

  certoConsiglio: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
  },

  // ---- Info Section inside rule card ----
  infoSection: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  infoLabel: {
    fontSize: fontSizes.small,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  infoText: {
    fontSize: fontSizes.bodySmall,
    fontFamily: FONT,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },

  // ---- Bullet List ----
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },

  bulletDot: {
    fontSize: fontSizes.bodySmall,
    color: colors.accent,
    marginRight: 6,
    width: 8,
  },

  bulletText: {
    fontSize: fontSizes.bodySmall,
    fontFamily: FONT,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 1.4,
  },

  // ---- Checklist ----
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 4,
  },

  checkbox: {
    fontSize: 14,
    color: colors.muted,
    marginRight: 10,
    width: 18,
  },

  checklistText: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    color: colors.text,
    flex: 1,
  },

  // ---- TOC ----
  tocEntry: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    paddingVertical: 3,
  },

  tocNumber: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.accent,
    width: 24,
  },

  tocTitle: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primary,
  },

  tocRuleCount: {
    fontSize: fontSizes.small,
    fontFamily: FONT,
    color: colors.muted,
    marginLeft: 6,
  },

  tocDots: {
    flex: 1,
    marginHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  tocPageNumber: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.accent,
    minWidth: 20,
    textAlign: "right",
  },

  // ---- Page Footer ----
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },

  pageFooterText: {
    fontSize: fontSizes.tiny,
    fontFamily: FONT,
    color: colors.mutedLight,
  },

  pageNumber: {
    fontSize: fontSizes.small,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.muted,
  },

  // ---- Divider ----
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 10,
  },

  // ---- Template Block ----
  templateBlock: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
  },

  templateTitle: {
    fontSize: fontSizes.h4,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 8,
  },

  templateText: {
    fontSize: fontSizes.bodySmall,
    fontFamily: FONT,
    color: colors.textSecondary,
    lineHeight: 1.7,
  },

  // ---- Cover Page ----
  coverPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: colors.primary,
    fontFamily: FONT,
  },

  coverContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 60,
  },

  coverBrand: {
    fontSize: fontSizes.h4,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 4,
    marginBottom: 30,
  },

  coverTitle: {
    fontSize: 32,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.white,
    textAlign: "center",
    lineHeight: 1.2,
    marginBottom: 14,
  },

  coverSubtitle: {
    fontSize: fontSizes.h4,
    fontFamily: FONT,
    color: colors.accentLight,
    textAlign: "center",
    marginBottom: 40,
  },

  coverStatsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginBottom: 60,
  },

  coverStatsNumber: {
    fontSize: fontSizes.h1,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.accent,
    marginRight: 10,
  },

  coverStatsLabel: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    color: colors.accentLight,
    maxWidth: 180,
  },

  coverDecorTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colors.accent,
  },

  coverDecorBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colors.accent,
  },

  coverFooter: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  coverFooterText: {
    fontSize: fontSizes.small,
    fontFamily: FONT,
    color: colors.mutedLight,
  },

  // ---- Chapter Header (fixed compact - repeats on every page) ----
  chapterHeaderFixed: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },

  chapterHeaderFixedNumber: {
    fontSize: fontSizes.small,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginRight: 8,
  },

  chapterHeaderFixedTitle: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primary,
  },

  // ---- Chapter Header (full - first page only) ----
  chapterHeader: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
  },

  chapterNumber: {
    fontSize: fontSizes.small,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },

  chapterTitle: {
    fontSize: fontSizes.h2,
    fontFamily: FONT,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 6,
  },

  chapterIntro: {
    fontSize: fontSizes.body,
    fontFamily: FONT,
    fontStyle: "italic",
    color: colors.muted,
    lineHeight: 1.5,
  },
});

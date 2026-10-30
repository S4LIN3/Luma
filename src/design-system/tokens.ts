/**
 * Luma Desktop Design System - Core Design Tokens
 * Brand: Luma - "Your Desktop, In Motion"
 * Design Direction: Minimal, Premium, Modern, Fluid, Elegant, Desktop-first.
 */

export const tokens = {
  colors: {
    // Light mode surfaces and text
    light: {
      surface: {
        base: "#f8fafc",        // Slate 50
        panel: "#ffffff",       // Pure white
        elevated: "#f1f5f9",    // Slate 100
        hover: "#e2e8f0",       // Slate 200
        active: "#cbd5e1",      // Slate 300
      },
      text: {
        primary: "#0f172a",     // Slate 900
        secondary: "#475569",   // Slate 600
        tertiary: "#94a3b8",    // Slate 400
        inverse: "#f8fafc",
      },
      border: {
        subtle: "rgba(15, 23, 42, 0.08)",
        default: "rgba(15, 23, 42, 0.12)",
        strong: "rgba(15, 23, 42, 0.2)",
      },
      shadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
        island: "0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06)",
      },
    },

    // Dark mode surfaces and text (default)
    dark: {
      surface: {
        base: "#030712",        // Gray 950 deep void
        panel: "#0b0f19",       // Subtle midnight slate
        elevated: "#151b2b",    // Elevated card
        hover: "#1f293d",       // Hover surface
        active: "#2a374f",      // Active surface
      },
      text: {
        primary: "#f8fafc",     // Slate 50
        secondary: "#94a3b8",   // Slate 400
        tertiary: "#64748b",    // Slate 500
        inverse: "#0f172a",
      },
      border: {
        subtle: "rgba(255, 255, 255, 0.06)",
        default: "rgba(255, 255, 255, 0.1)",
        strong: "rgba(255, 255, 255, 0.18)",
      },
      shadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        md: "0 4px 12px -2px rgba(0, 0, 0, 0.6)",
        lg: "0 12px 24px -4px rgba(0, 0, 0, 0.7)",
        island: "0 16px 40px -6px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      },
    },

    // Accent colors
    accents: {
      indigo: {
        base: "#6366f1",
        hover: "#4f46e5",
        subtle: "rgba(99, 102, 241, 0.15)",
        text: "#818cf8",
      },
      violet: {
        base: "#8b5cf6",
        hover: "#7c3aed",
        subtle: "rgba(139, 92, 246, 0.15)",
        text: "#a78bfa",
      },
      emerald: {
        base: "#10b981",
        hover: "#059669",
        subtle: "rgba(16, 185, 129, 0.15)",
        text: "#34d399",
      },
      amber: {
        base: "#f59e0b",
        hover: "#d97706",
        subtle: "rgba(245, 158, 11, 0.15)",
        text: "#fbbf24",
      },
      rose: {
        base: "#f43f5e",
        hover: "#e11d48",
        subtle: "rgba(244, 63, 94, 0.15)",
        text: "#fb7185",
      },
      cyan: {
        base: "#06b6d4",
        hover: "#0891b2",
        subtle: "rgba(6, 182, 212, 0.15)",
        text: "#22d3ee",
      },
    },

    status: {
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#3b82f6",
    },
  },

  // Motion physics springs for Framer Motion
  springs: {
    // Ultra snappy for toggles, micro-indicators and buttons
    snappy: {
      type: "spring" as const,
      stiffness: 500,
      damping: 35,
      mass: 0.8,
    },
    // Smooth fluid spring for Notch expansion & Dock magnification
    fluid: {
      type: "spring" as const,
      stiffness: 380,
      damping: 28,
      mass: 0.9,
    },
    // Gentle spring for modals, popovers, and drawer reveals
    gentle: {
      type: "spring" as const,
      stiffness: 260,
      damping: 24,
      mass: 1.0,
    },
    // Subtle bounce for hover feedback
    bouncy: {
      type: "spring" as const,
      stiffness: 450,
      damping: 20,
    },
  },

  // Radii
  radii: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    full: "9999px",
  },
};

export type ThemeMode = "system" | "dark" | "light";
export type AccentName = "indigo" | "violet" | "emerald" | "amber" | "rose" | "cyan";

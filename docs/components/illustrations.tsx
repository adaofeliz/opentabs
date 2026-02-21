/**
 * Inline SVG illustrations for docs pages.
 * Follow the neo-brutalist style from ArchitectureIllustration in app/(marketing)/page.tsx:
 * - CSS variables for theming (--color-foreground, --color-primary, --color-background)
 * - var(--font-mono) for text
 * - 3px strokeWidth on main borders
 * - Hard drop shadows (offset rect)
 * - Box-with-header-bar pattern
 * - No border-radius
 */

/**
 * QuickStartFlow — 3-step flow for the Quick Start page.
 * Install → Start → Use, with arrows between steps.
 */
export const QuickStartFlow = () => (
  <div className="my-8">
    <svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" aria-hidden="true">
      <defs>
        <marker id="qs-arrow" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto">
          <path d="M0,0 L10,4 L0,8 Z" fill="var(--color-foreground)" />
        </marker>
      </defs>

      {/* ── Step 1: Install ───────────────────────────────── */}
      {/* Shadow */}
      <rect x="8" y="18" width="200" height="120" fill="var(--color-foreground)" />
      {/* Body */}
      <rect
        x="4"
        y="14"
        width="200"
        height="120"
        fill="var(--color-background)"
        stroke="var(--color-foreground)"
        strokeWidth="3"
      />
      {/* Header */}
      <rect x="4" y="14" width="200" height="36" fill="var(--color-foreground)" />
      <text
        x="104"
        y="38"
        fontSize="13"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        fontWeight="bold"
        textAnchor="middle">
        1. Install
      </text>
      {/* Content */}
      <rect x="16" y="64" width="176" height="26" fill="var(--color-foreground)" />
      <text
        x="104"
        y="82"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        textAnchor="middle">
        npm i -g @opentabs-dev/cli
      </text>
      <text
        x="104"
        y="118"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-foreground)"
        opacity="0.5"
        textAnchor="middle">
        + Load Chrome extension
      </text>

      {/* ── Arrow 1→2 ────────────────────────────────────── */}
      <line
        x1="214"
        y1="74"
        x2="290"
        y2="74"
        stroke="var(--color-foreground)"
        strokeWidth="2"
        markerEnd="url(#qs-arrow)"
      />

      {/* ── Step 2: Start ────────────────────────────────── */}
      {/* Shadow */}
      <rect x="308" y="18" width="200" height="120" fill="var(--color-foreground)" />
      {/* Body */}
      <rect
        x="304"
        y="14"
        width="200"
        height="120"
        fill="var(--color-primary)"
        stroke="var(--color-foreground)"
        strokeWidth="3"
      />
      {/* Header */}
      <rect x="304" y="14" width="200" height="36" fill="var(--color-foreground)" />
      <text
        x="404"
        y="38"
        fontSize="13"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        fontWeight="bold"
        textAnchor="middle">
        2. Start
      </text>
      {/* Content */}
      <rect x="316" y="64" width="176" height="26" fill="var(--color-foreground)" />
      <text
        x="404"
        y="82"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        textAnchor="middle">
        opentabs start
      </text>
      <text
        x="404"
        y="118"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-foreground)"
        opacity="0.5"
        textAnchor="middle">
        localhost:9515
      </text>

      {/* ── Arrow 2→3 ────────────────────────────────────── */}
      <line
        x1="514"
        y1="74"
        x2="590"
        y2="74"
        stroke="var(--color-foreground)"
        strokeWidth="2"
        markerEnd="url(#qs-arrow)"
      />

      {/* ── Step 3: Use ──────────────────────────────────── */}
      {/* Shadow */}
      <rect x="608" y="18" width="188" height="120" fill="var(--color-foreground)" />
      {/* Body */}
      <rect
        x="604"
        y="14"
        width="188"
        height="120"
        fill="var(--color-background)"
        stroke="var(--color-foreground)"
        strokeWidth="3"
      />
      {/* Header */}
      <rect x="604" y="14" width="188" height="36" fill="var(--color-foreground)" />
      <text
        x="698"
        y="38"
        fontSize="13"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        fontWeight="bold"
        textAnchor="middle">
        3. Use
      </text>
      {/* Content */}
      <rect x="616" y="64" width="164" height="26" fill="var(--color-foreground)" />
      <text
        x="698"
        y="82"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        textAnchor="middle">
        slack_send_message()
      </text>
      <text
        x="698"
        y="118"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-foreground)"
        opacity="0.5"
        textAnchor="middle">
        AI agent calls tools
      </text>
    </svg>
  </div>
);

/**
 * PluginStructure — project structure diagram for the Plugin Development guide.
 * Shows the key files in a scaffolded plugin project as a tree.
 */
export const PluginStructure = () => (
  <div className="my-8">
    <svg
      viewBox="0 0 520 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg"
      aria-hidden="true">
      {/* ── Main box ──────────────────────────────────────── */}
      {/* Shadow */}
      <rect x="8" y="8" width="508" height="328" fill="var(--color-foreground)" />
      {/* Body */}
      <rect
        x="4"
        y="4"
        width="508"
        height="328"
        fill="var(--color-background)"
        stroke="var(--color-foreground)"
        strokeWidth="3"
      />
      {/* Header */}
      <rect x="4" y="4" width="508" height="36" fill="var(--color-foreground)" />
      {/* Traffic lights */}
      <circle cx="24" cy="22" r="5" fill="var(--color-primary)" />
      <circle cx="40" cy="22" r="5" fill="var(--color-background)" opacity="0.4" />
      <circle cx="56" cy="22" r="5" fill="var(--color-background)" opacity="0.4" />
      <text
        x="258"
        y="27"
        fontSize="12"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        fontWeight="bold"
        textAnchor="middle">
        opentabs-plugin-my-app/
      </text>

      {/* ── File tree ─────────────────────────────────────── */}
      {/* package.json */}
      <text x="28" y="68" fontSize="12" fontFamily="var(--font-mono), monospace" fill="var(--color-foreground)">
        package.json
      </text>
      <text
        x="220"
        y="68"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-foreground)"
        opacity="0.45">
        name, opentabs metadata, deps
      </text>

      {/* tsconfig.json */}
      <text x="28" y="94" fontSize="12" fontFamily="var(--font-mono), monospace" fill="var(--color-foreground)">
        tsconfig.json
      </text>
      <text
        x="220"
        y="94"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-foreground)"
        opacity="0.45">
        strict, ES2022, ESM
      </text>

      {/* lint and format config */}
      <text
        x="28"
        y="120"
        fontSize="12"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-foreground)"
        opacity="0.5">
        eslint.config.ts / .prettierrc
      </text>

      {/* Divider */}
      <line x1="20" y1="138" x2="500" y2="138" stroke="var(--color-foreground)" strokeWidth="1" opacity="0.15" />

      {/* src/ directory */}
      <text
        x="28"
        y="164"
        fontSize="12"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        fontWeight="bold">
        src/
      </text>

      {/* src/index.ts — plugin class with highlight box */}
      <rect
        x="48"
        y="176"
        width="440"
        height="30"
        fill="var(--color-primary)"
        opacity="0.12"
        stroke="var(--color-foreground)"
        strokeWidth="1.5"
      />
      <text x="62" y="196" fontSize="12" fontFamily="var(--font-mono), monospace" fill="var(--color-foreground)">
        index.ts
      </text>
      <text
        x="220"
        y="196"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-foreground)"
        opacity="0.6">
        Plugin class — name, urlPatterns, isReady()
      </text>

      {/* src/tools/ directory */}
      <text
        x="62"
        y="232"
        fontSize="12"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        fontWeight="bold">
        tools/
      </text>

      {/* Tool files */}
      <rect x="82" y="244" width="400" height="26" fill="var(--color-foreground)" />
      <text x="96" y="262" fontSize="11" fontFamily="var(--font-mono), monospace" fill="var(--color-primary)">
        get-items.ts
      </text>
      <text
        x="280"
        y="262"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-primary)"
        opacity="0.6">
        {'defineTool({ name, input, output, handle })'}
      </text>

      <rect
        x="82"
        y="278"
        width="400"
        height="26"
        fill="var(--color-background)"
        stroke="var(--color-foreground)"
        strokeWidth="1.5"
      />
      <text x="96" y="296" fontSize="11" fontFamily="var(--font-mono), monospace" fill="var(--color-foreground)">
        create-item.ts
      </text>

      <rect
        x="82"
        y="308"
        width="400"
        height="18"
        fill="var(--color-background)"
        stroke="var(--color-foreground)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text
        x="282"
        y="321"
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        fill="var(--color-foreground)"
        opacity="0.4"
        textAnchor="middle">
        one file per tool...
      </text>
    </svg>
  </div>
);

---
name: KnightMind
description: AI Based Learning Platform — premium chess study room in Obsidian Bronze
colors:
  obsidian: "#171614"
  charcoal: "#22201D"
  slate-ash: "#2F2B27"
  stone: "#4A443C"
  divider: "#6E675E"
  ivory: "#F4EFE7"
  parchment: "#B7AFA2"
  faded: "#8E8578"
  bronze: "#C89B5A"
  bronze-hover: "#D8A867"
  antique-brass: "#B78643"
  sage: "#7FA38A"
  sage-light: "#A8C1A5"
  clay: "#C97A5D"
  crimson: "#A64F4F"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 5vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.14em"
  data:
    fontFamily: "ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
rounded:
  md: "8px"
  lg: "12px"
  xl: "16px"
  board-frame: "22.4px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.obsidian}"
    rounded: "{rounded.lg}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "{colors.bronze-hover}"
  tab-active:
    backgroundColor: "{colors.slate-ash}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.md}"
---

# Design System: KnightMind

## Overview

**Creative North Star: "The Obsidian Study Room"**

KnightMind is a lacquered, warm near-black chess study where a single brass instrument — bronze — marks everything the engine touches, and a quiet green voice — sage — speaks only for the AI Coach. Surfaces read as stacked lacquer trays (obsidian ground, charcoal trays, slate-ash wells) rather than floating glass; depth comes from soft black drop shadows with real offset, never from glow-as-decoration. Whitespace is generous, headings carry more space above than below, and the board is always the visual hero at roughly 60% of the workspace's attention.

**Key Characteristics:**
- Warm neutral lacquer carries ~70% of every screen; white/ivory carries most typography
- Bronze is the instrument accent (~15%): evaluations, best moves, primary CTAs
- Sage is the coach's identity (~5%): AI Coach branding, insights, active tab underline, positive indicators
- One authored motion moment per view (`rise` / `settle`), restrained state transitions otherwise

## Colors

A warm dark-neutral palette with two disciplined accents: bronze for machine intelligence, sage for coaching intelligence.

### Primary
- **Bronze** (#C89B5A): evaluation number, best-move pill, primary buttons, brand emblem gradient, step numerals. The engine's signature metal.

### Secondary
- **Sage** (#7FA38A): AI Coach iconography, card ring and hairline accents, engine-live pulse dot, active tab underline, success states.
- **Sage Light** (#A8C1A5): readable sage text on dark grounds (badge copy, insight tags).

### Tertiary
- **Clay** (#C97A5D): warning-toned insight tags (recurring weaknesses).
- **Crimson** (#A64F4F): king-in-check square wash.

### Neutral
- **Obsidian** (#171614): page ground.
- **Charcoal** (#22201D): raised trays — cards, side panel, header surface.
- **Slate Ash** (#2F2B27): inset wells — eval section, tab thumb, feature icon chips.
- **Stone** (#4A443C): borders and rings at 30–60% opacity.
- **Divider** (#6E675E): hairline dividers inside controls.
- **Ivory** (#F4EFE7): primary type.
- **Parchment** (#B7AFA2): secondary type and body copy on dark.
- **Faded** (#8E8578): muted captions ≥11px medium; never body-critical text.

### Named Rules
**The Two Voices Rule.** Bronze speaks for the engine, sage speaks for the coach; neither borrows the other's role, and together they stay near 20% of any screen. White carries the words.
**The Soft Sage Rule.** Wherever sage appears as text below 12px, use Sage Light (#A8C1A5) for contrast; raw sage is for shapes and icons.

## Typography

**Display Font:** Inter (with ui-sans-serif/system-ui fallback)
**Body Font:** Inter (same stack)
**Label/Mono Font:** ui-monospace stack for engine output and chess notation only

**Character:** One humanist workhorse face across every role; hierarchy is earned through weight, size, and spacing rather than family changes.

### Hierarchy
- **Display** (600, clamp(3rem–3.75rem), 1.08, −0.03em): welcome hero only, balanced two-line statement.
- **Headline** (600, 1.875rem, −0.025em): section titles ("How KnightMind Works").
- **Title** (600, 1rem): card titles, panel headers, wordmark.
- **Body** (400, 1rem, 1.625): descriptions; measure capped near 65ch.
- **Label** (500, 0.6875rem, 0.14em, uppercase): group labels ("Evaluation", "Sample insights").
- **Data** (mono, 0.6875rem–0.8125rem, 600): evaluations, best moves, principal variation, move notation.

### Named Rules
**The Data Is Mono Rule.** Monospace is reserved for measurable chess data — notation, evaluations, PV lines — never as a decorative "technical" costume.

## Layout

Single-column welcome centered at max-width 48rem (hero) and 64rem (card grid). Workspace opens at max-width 85rem with the board column flexing to 55rem against a fixed 26.25rem side panel, sticky at top 5rem, panel height 42rem. Gap between columns 2.5rem. Vertical rhythm: more space above headings than below (e.g. pt-16/pb-14 section frames). Responsive: workspace stacks board above panel below `xl` (1280px); feature cards collapse 3→1 below `md` (768px); header tagline hides below `sm` (640px).

## Elevation & Depth

Hybrid: tonal layering (obsidian → charcoal → slate-ash) does the structural work; shadows mark genuinely raised chrome. All shadows pair a real y-offset with a soft blur and negative spread — zero-offset halos are not used. Colored glows appear only as ambient light pools behind the two hero objects (board frame, coach hero) at 7–15% opacity under heavy blur.

### Shadow Vocabulary
- **Tray rest** (`0 24px 60px -24px rgba(0,0,0,0.6)`): side panel, large cards.
- **Board plinth** (`0 28px 70px -24px rgba(0,0,0,0.7)` + inset top highlight `rgba(244,239,231,0.05)`): board frame.
- **Floating control** (`0 16px 40px -12px rgba(0,0,0,0.7)`): navigation toolbar over the board.
- **Primary action lift** (`0 12px 24px -8px rgba(200,155,90,0.25)`): bronze buttons, deepening on hover.

### Named Rules
**The Lacquer Rule.** Surfaces are flat at rest within their tonal layer; elevation is reserved for elements that float or respond (toolbar, hovered cards, pressed-out modals).

## Shapes

Rounded geometry throughout, scaled to object size: 8px for compact chips and tab cells, 12px for buttons and inner wells, 16px for cards and panels, 22.4px for the board plinth, full-round pills for the turn indicator and toolbar. Borders are 1px Stone at reduced opacity; emphasis rings (bronze/sage) replace thicker strokes. The knight emblem sits in a rounded-square tile with an inner top highlight.

## Components

### Buttons
- **Shape:** 12px radius rectangle
- **Primary:** Bronze fill (#C89B5A), Obsidian text (600 weight), 14px×32px padding; hover lifts −2px into Bronze Hover (#D8A867) with a bronze-tinted shadow; active returns to rest.
- **Ghost:** text-only bronze/gold links on transparent ground; hover adds a 10%-bronze field.
- **Disabled:** 35% opacity, pointer-events none.

### Segmented Tab Control
- **Style:** full-round obsidian track (70% opacity, 1px Stone ring) holding equal-width cells; a slate-ash thumb slides beneath the active label (300ms ease-out transform).
- **Active state:** ivory label plus a 16px×2px sage underline bar fading in — the product's signature sage accent.
- **Hover:** inactive labels brighten Faded → Parchment.

### Cards / Containers
- **Corner Style:** 16px radius
- **Background:** Charcoal on Obsidian; inset wells at Slate Ash 40–45%
- **Border:** 1px Stone/50; interactive cards lift −4px on hover with deepened shadow
- **Internal Padding:** 24px (feature/coach cards), 16px (list rows, sub-cards)

### Game List Item
- Full-width button row, 16px radius, left-mounted 3px bronze activity rail (visible when selected, 30% on hover), result rendered as a mono chip in an obsidian well.

### Move History Row
- Three-column grid (1.75rem numeral column, two move cells); numerals right-aligned tabular figures; current move wears a 15%-bronze field with 1px bronze/30 ring; hover adds a 4%-white field.

### Evaluation Card
- Slate-ash well: label row (Label style + live sage pulse dot), 2rem bronze tabular evaluation figure, plain-language description, Depth/Best meta row, single-hairline-separated principal-variation line in mono.

### Turn Indicator
- Pill: charcoal field, 1px Stone/40 border, 12px side-color disc (ivory filled / obsidian ringed), capitalized "White to move".

## Do's and Don'ts

### Do:
- **Do** keep the chessboard squares exactly as they are (light #FEF3C7-family / dark #92400E-family Tailwind ambers) — the board is heritage, not themable surface.
- **Do** theme browser chrome from the palette: selection (bronze 28%), caret (ivory), thin scrollbars (stone thumb), focus-visible (bronze 75% outline, 2px offset).
- **Do** respect `prefers-reduced-motion`; entrance animations degrade to instant.
- **Do** label coach placeholder content honestly ("Sample insights") until the ML pipeline ships.

### Don't:
- **Don't** apply neon, RGB-gaming gradients, heavy glassmorphism, or clutter — the brief names these as anti-references.
- **Don't** let sage exceed its ~5% presence or speak for anything that isn't the AI Coach.
- **Don't** use unicode glyphs or emoji where drawn SVG icons belong; icons are authored inline SVG at a consistent 1.6 stroke.
- **Don't** market copy like a generic AI startup; intelligence shows through the experience, not through sparkle badges.

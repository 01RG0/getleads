# LeadScale — Color Palette

This document defines the official color system for LeadScale, covering both Light and Dark modes. It should be treated as the single source of truth for UI colors across the landing page, console, and any future product surfaces.

## Design Principles

- **Primary (Amber/Ochre)** is distinct from Firecrawl's bright orange and from Claude/Anthropic's terracotta-coral identity — deliberately chosen as a deeper, more muted ochre tone to avoid visual association with either.
- **Status colors** (Success, Warning, Danger) are kept visually separate from Primary so users can instantly distinguish "brand/action" from "system state" — this matters most for Success, since a warm amber Primary sitting next to a warm badge could get confused.
- **Dark mode** uses the same hues as Light mode, lifted in lightness so they stay legible on dark backgrounds without feeling harsh.

---

## Primary (Amber / Ochre)

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `primary` | `#A6631F` | `#D68A3E` | Buttons, links, CTAs, logo, active states |
| `primary-hover` | `#8C5219` | `#E29A52` | Hover/pressed states on primary elements |
| `primary-subtle` | `#F5E6D3` | `#3A2A18` | Badge backgrounds, highlights, subtle fills |

## Backgrounds & Text

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `background` | `#FAF8F5` | `#161310` | Page background |
| `surface` | `#FFFFFF` | `#1F1B16` | Cards, panels, modals |
| `ink` | `#1C1712` | `#F0E9E0` | Primary text |
| `muted` | `#6B6055` | `#A69B8E` | Secondary/muted text, placeholders |

## Status Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `success` | `#3D7A4E` | `#5FA372` | Verified state, positive confirmations |
| `warning` | `#C99A2E` | `#D9AE4E` | Needs attention, degraded state |
| `danger` | `#B94E27` | `#E07850` | Errors, failed verification, destructive actions |

---

## Notes

- Do not use `primary` to represent status (e.g. "verified"). Use `success` for that — keeping brand color and system-state color separate avoids user confusion, especially when badges sit near buttons.
- When adding new UI elements, prefer reusing these tokens over introducing new hex values. If a new shade is needed, derive it from an existing token (adjust lightness only) to keep the palette coherent.
- Dark mode is not simply "inverted" — each dark value was manually lifted in lightness relative to its light counterpart to remain readable on dark surfaces (`#161310` / `#1F1B16`) without appearing washed out or overly saturated.

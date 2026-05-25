---
name: Accent color system
description: How accent colors are stored, applied, and synced in Onyx AI.
---

Colors are stored as HSL value strings without the `hsl()` wrapper, e.g. `"187 100% 42%"`.

The CSS variable `--onyx-accent` is set inline on `document.documentElement` and consumed by `--primary`, `--ring`, `--sidebar-primary`, etc. in index.css using `var(--onyx-accent, 187 100% 42%)` as fallback.

**Why apply in ThemeContext (not AccentColorPicker):** AccentColorPicker is only mounted on SettingsPage, so if the effect lived there, the accent color would not be applied on other pages after a page reload.

**How to apply:** The `applyAccentColor(hsl)` helper in ThemeContext sets all relevant CSS vars in one call. Call it both in the settings-load effect and in the accentColor change effect.

Default stored value in DB should be `"187 100% 42%"` (not `"cyan"`).

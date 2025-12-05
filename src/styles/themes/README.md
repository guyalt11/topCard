# Color Themes

This directory contains all color scheme definitions for the application.

## Available Themes

- **dark.css** - Default dark teal theme
- **light.css** - Clean and bright light theme
- **neubrutalism.css** - Bold, high-contrast theme

## Adding a New Theme

To add a new color theme:

1. **Create a new CSS file** in this directory (e.g., `mytheme.css`)

2. **Define your theme** using the following template:

```css
[data-theme="mytheme"] {
  /* Background & Foreground */
  --background: #000000;
  --foreground: #FFFFFF;

  /* Primary color */
  --light: #00E5CC;
  --light-foreground: #000000;

  /* Secondary color */
  --primary: #0A3D41;
  --primary-foreground: #FFFFFF;

  /* Tertiary color */
  --secondary: #0a2c30;
  --secondary-foreground: #FFFFFF;

  /* Danger - for destructive actions */
  --danger: #D92626;
  --danger-foreground: #FFFFFF;

  /* Dark - for dark accents */
  --dark: #020b0b;
  --dark-foreground: #FFFFFF;

  /* Light - for light accents */
  --tertiary: #00A39C;
  --tertiary-foreground: #B3B3B3;

  /* Utility colors */
  --border: var(--secondary);
  --input: var(--secondary);
  --ring: #00E5CC;
  --radius: 0.5rem;

  /* Button colors */
  --btn-1: #00E5CC;
  --btn-2: #00C4B4;
  --btn-3: #00A39C;
  --btn-4: #009390;
  --btn-5: #008284;

  /* Progress bar colors */
  --r-start: 0;
  --g-start: 130;
  --b-start: 132;
  --a-start: 1;
  --r-end: 0;
  --g-end: 229;
  --b-end: 204;
  --a-end: 1;

  /* Gradient colors */
  --gradient-from: #154C52;
  --gradient-to: #082326;

  /* Difficulty colors */
  --difficulty-hard: #F87171;
  --difficulty-ok: #FCD34D;
  --difficulty-good: #60A5FA;
  --difficulty-perfect: #A3E635;

  /* Gender colors */
  --gender-male: #a4cdff;
  --gender-male-foreground: #414141ff;
  --gender-female: #ffb6b6;
  --gender-female-foreground: #414141ff;
  --gender-neuter: #a1ffa1;
  --gender-neuter-foreground: #414141ff;
  --gender-common: #fdff9e;
  --gender-common-foreground: #414141ff;

  /* Gradient utilities */
  --gradient-dark: linear-gradient(135deg, var(--gradient-from) 0%, var(--gradient-to) 100%);
  --gradient-tertiary: linear-gradient(135deg, var(--btn-1) 0%, var(--btn-3) 100%);
}
```

3. **Import the theme** in `src/index.css`:

```css
@import './styles/themes/mytheme.css';
```

4. **Add to Settings UI** in `src/pages/Settings.tsx`:

Add your theme to the array:
```tsx
{ value: 'mytheme', label: 'My Theme', description: 'Description of my theme' }
```

5. **Update TypeScript type** in `src/context/PreferencesContext.tsx`:

```tsx
type ColorScheme = 'dark' | 'light' | 'neubrutalism' | 'mytheme';
```

That's it! Your new theme will now be available in the Settings page.

## Color Variables Reference

### Core Colors
- `--background` / `--foreground` - Main background and text colors
- `--light` / `--light-foreground` - Primary accent color
- `--primary` / `--primary-foreground` - Secondary accent color
- `--secondary` / `--secondary-foreground` - Tertiary accent color
- `--danger` / `--danger-foreground` - Error/destructive action color
- `--dark` / `--dark-foreground` - Dark accent color
- `--tertiary` / `--tertiary-foreground` - Light accent color

### Utility Colors
- `--border` - Default border color
- `--input` - Input field background
- `--ring` - Focus ring color
- `--radius` - Border radius (e.g., 0.5rem)

### Button Colors
- `--btn-1` through `--btn-5` - Button color variations

### Progress Bar Colors
- `--r-start`, `--g-start`, `--b-start`, `--a-start` - Start color RGBA components
- `--r-end`, `--g-end`, `--b-end`, `--a-end` - End color RGBA components

### Gradient Colors
- `--gradient-from` / `--gradient-to` - Gradient start/end colors
- `--gradient-dark` / `--gradient-tertiary` - Computed gradient utilities

### Difficulty Colors
- `--difficulty-hard` - Hard difficulty color
- `--difficulty-ok` - OK difficulty color
- `--difficulty-good` - Good difficulty color
- `--difficulty-perfect` - Perfect difficulty color

### Gender Colors
- `--gender-male` / `--gender-male-foreground` - Male gender color
- `--gender-female` / `--gender-female-foreground` - Female gender color
- `--gender-neuter` / `--gender-neuter-foreground` - Neuter gender color
- `--gender-common` / `--gender-common-foreground` - Common gender color

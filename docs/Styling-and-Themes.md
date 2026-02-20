# Styling and Themes

The Object Editor ships with a clean default theme and its HTML structure is fully customizable through CSS classes and MacroTemplate overrides. The example application includes five additional themes demonstrating a range of visual approaches.

## CSS Architecture

The editor renders a flat list of `<div>` rows inside a container element. There are no nested DOM structures for child nodes -- depth is expressed solely through left padding on each row. This makes CSS styling straightforward.

### Container

```
div.pict-objecteditor
  div.pict-oe-row          (one per visible node)
    span.pict-oe-toggle     (expand/collapse arrow, containers only)
    span.pict-oe-spacer     (leaf nodes, replaces toggle to maintain alignment)
    span.pict-oe-key        (property name or array index)
    span.pict-oe-separator  (colon between key and value, leaf nodes)
    span.pict-oe-value      (the value display, leaf nodes)
    span.pict-oe-type-badge (type label, containers only)
    span.pict-oe-summary    (child count, containers only)
    span.pict-oe-actions    (action buttons wrapper)
      span.pict-oe-action-btn  (individual buttons)
  div.pict-oe-root-add     (root-level add button)
```

### CSS Classes Reference

| Class | Element | Description |
|-------|---------|-------------|
| `.pict-objecteditor` | Container | Outer container, font, colors, border, scroll |
| `.pict-oe-row` | Row | Flex row for a single node |
| `.pict-oe-toggle` | Toggle | Expand/collapse arrow button |
| `.pict-oe-spacer` | Spacer | Invisible spacer replacing toggle on leaf nodes |
| `.pict-oe-key` | Key | Property name display |
| `.pict-oe-array-index` | Key child | Numeric index inside key span |
| `.pict-oe-separator` | Separator | Colon between key and value |
| `.pict-oe-value` | Value | Base class for all value displays |
| `.pict-oe-value-string` | Value | String values (includes `::before`/`::after` quote marks) |
| `.pict-oe-value-number` | Value | Number values |
| `.pict-oe-value-boolean` | Value | Boolean values |
| `.pict-oe-value-null` | Value | Null values |
| `.pict-oe-summary` | Summary | Container child count (e.g. `{3 keys}`) |
| `.pict-oe-type-badge` | Badge | Type indicator (e.g. `obj`, `arr`) |
| `.pict-oe-empty` | Empty | Shown when data is empty or null |
| `.pict-oe-actions` | Actions | Wrapper for action buttons, auto-fades |
| `.pict-oe-action-btn` | Button | Base class for all action buttons |
| `.pict-oe-action-add` | Button | Add button (green tones) |
| `.pict-oe-action-remove` | Button | Remove button (red tones) |
| `.pict-oe-action-move` | Button | Move up/down buttons (blue tones) |
| `.pict-oe-value-input` | Input | Inline text/number edit field |
| `.pict-oe-key-input` | Input | Key name input when adding a property |
| `.pict-oe-type-select` | Select | Type dropdown when adding a property/element |
| `.pict-oe-root-add` | Container | Root-level add button row |

## Customizing with CSS

### Override the Default Theme

The simplest way to customize is to add CSS rules after the editor loads. The editor injects its CSS into `<style id="PICT-CSS">`, so your own `<style>` block or stylesheet loaded after that will take precedence:

```html
<style id="PICT-CSS"></style>
<style>
	/* Your overrides */
	.pict-objecteditor
	{
		font-family: 'Fira Code', monospace;
		font-size: 14px;
		max-height: 800px;
	}
	.pict-oe-key
	{
		color: #D63384;
	}
	.pict-oe-value-string
	{
		color: #198754;
	}
</style>
```

### Theme via data-theme Attribute

The example application demonstrates a theme switcher using a `data-theme` attribute on the container element. This pattern scopes theme CSS without affecting other instances:

```javascript
function setTheme(pThemeName)
{
	var tmpEditor = document.querySelector('.pict-objecteditor');
	if (!tmpEditor) { return; }
	if (pThemeName === 'basic')
	{
		tmpEditor.removeAttribute('data-theme');
	}
	else
	{
		tmpEditor.setAttribute('data-theme', pThemeName);
	}
}
```

Then scope your CSS:

```css
.pict-objecteditor[data-theme="mytheme"]
{
	background: #1A1A2E;
	color: #E0E0E0;
	border-color: #333355;
}
.pict-objecteditor[data-theme="mytheme"] .pict-oe-key
{
	color: #FF6B6B;
}
/* ... more rules ... */
```

### Replacing CSS via Configuration

You can provide a completely custom CSS string in the view configuration. This replaces the default CSS entirely:

```javascript
pict.addView('Editor',
{
	ObjectDataAddress: 'AppData.Data',
	DefaultDestinationAddress: '#editor',
	CSS: `
		.pict-objecteditor { /* your complete styles */ }
		.pict-oe-row { /* ... */ }
		/* ... */
	`,
	Renderables: [...]
},
libPictSectionObjectEditor);
```

## Customizing with MacroTemplates

For structural changes beyond CSS, override individual MacroTemplates. Each HTML fragment is a Jellyfish template string that gets compiled with the node data.

### Example: Custom Separator

```javascript
MacroTemplates:
{
	Node:
	{
		Separator: '<span class="pict-oe-separator"> => </span>'
	}
}
```

### Example: Custom Value Display

```javascript
MacroTemplates:
{
	Node:
	{
		ValueBooleanEditable: '<span class="pict-oe-value pict-oe-value-boolean my-bool" onclick="{~P~}.views[\'{~D:Context[0].Hash~}\'].toggleBoolean(\'{~D:Record.EscapedPath~}\')">{~D:Record.DisplayValue~}</span>'
	}
}
```

### Example: Remove Type Badges

Either set `ShowTypeIndicators: false` in configuration, or override the macro:

```javascript
MacroTemplates:
{
	Node:
	{
		TypeBadge: ''
	}
}
```

## Built-In Demo Themes

The example application at `example_applications/json_editor/html/index.html` includes six visual themes. Each is implemented purely in CSS using the `data-theme` attribute pattern.

### Basic (Default)

The default theme with warm, paper-like tones. Monospace font, subtle hover effects, and a clean flat design.

- **Background:** Warm off-white (`#FDFCFA`)
- **Keys:** Burnt sienna (`#9E6B47`)
- **Strings:** Teal (`#2E7D74`)
- **Numbers:** Steel blue (`#3B6DAA`)
- **Booleans:** Warm brown (`#8B5E3C`)
- **Font:** SF Mono, Fira Code, Cascadia Code, JetBrains Mono, Consolas

### Midnight

A dark mode theme inspired by the Catppuccin Mocha palette. High contrast with vibrant accent colors on a dark background.

- **Background:** Deep navy (`#1E1E2E`)
- **Keys:** Pink (`#F38BA8`)
- **Strings:** Green (`#A6E3A1`)
- **Numbers:** Peach (`#FAB387`)
- **Booleans:** Lavender (`#CBA6F7`)
- **Nulls:** Muted overlay (`#6C7086`)

### Blueprint

A technical, engineering-drawing aesthetic with grid lines, uppercase keys, and zero border radius. Evokes architectural documentation.

- **Background:** Light blue-gray with grid pattern (`#F0F4F8`)
- **Border:** Double-weight blue (`2px solid #90B4CE`)
- **Keys:** Dark navy, uppercase, letter-spaced (`#1A3A5C`)
- **Strings:** Forest green (`#2D6A4F`)
- **Numbers:** Red (`#BF4040`)
- **Booleans:** Purple, uppercase (`#6B3FA0`)
- **Font:** Courier New

### Solarized

Based on the Solarized light color scheme by Ethan Schoonover. Features a distinctive left-border highlight on hover.

- **Background:** Solarized base3 (`#FDF6E3`)
- **Keys:** Solarized blue (`#268BD2`)
- **Strings:** Solarized cyan (`#2AA198`)
- **Numbers:** Solarized magenta (`#D33682`)
- **Booleans:** Solarized orange (`#CB4B16`)
- **Hover:** Left border highlight in blue
- **Font:** IBM Plex Mono, Source Code Pro

### Terminal

A retro CRT terminal look with green phosphor text, scan-line glow effects, and a pitch-black background. Text shadows simulate the CRT glow.

- **Background:** Near-black (`#0A0A0A`) with inset shadow
- **Keys:** Yellow with glow (`#FFFF33`)
- **Strings:** Bright green with glow (`#33FF33`)
- **Numbers:** Cyan with glow (`#33CCFF`)
- **Booleans:** Orange with glow (`#FF6633`)
- **Nulls:** Uppercase, muted green
- **Font:** VT323, Lucida Console

### Spreadsheet

A data-grid style inspired by Google Sheets. Sans-serif font, alternating row colors, subtle shadows on buttons, and a clean corporate feel.

- **Background:** White (`#FFFFFF`)
- **Border:** Gray grid lines (`#BABFC4`)
- **Keys:** Bold black (`#222222`)
- **Strings:** Dark green (`#0D652D`)
- **Numbers:** Google blue with tabular numerals (`#1A73E8`)
- **Booleans:** Amber, bold (`#EA8600`)
- **Rows:** Alternating white/light gray with blue hover
- **Buttons:** Subtle box shadows with active press states
- **Font:** System UI (Apple, Segoe UI, Roboto)

## Writing a Custom Theme

To create your own theme, follow this pattern:

### 1. Define Your Theme CSS

At minimum, override the container and the key value colors. For a complete theme, cover all these selectors:

```css
/* Container */
.pict-objecteditor[data-theme="mytheme"] { }

/* Row structure */
.pict-objecteditor[data-theme="mytheme"] .pict-oe-row { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-row:hover { }

/* Navigation */
.pict-objecteditor[data-theme="mytheme"] .pict-oe-toggle { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-toggle:hover { }

/* Keys and values */
.pict-objecteditor[data-theme="mytheme"] .pict-oe-key { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-separator { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-value-string { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-value-string::before,
.pict-objecteditor[data-theme="mytheme"] .pict-oe-value-string::after { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-value-number { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-value-boolean { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-value-null { }

/* Containers */
.pict-objecteditor[data-theme="mytheme"] .pict-oe-summary { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-type-badge { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-array-index { }

/* Action buttons */
.pict-objecteditor[data-theme="mytheme"] .pict-oe-action-btn { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-action-btn:hover { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-action-remove:hover { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-action-move:hover { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-action-add:hover { }

/* Root add button (wider than icon buttons) */
.pict-objecteditor[data-theme="mytheme"] .pict-oe-root-add .pict-oe-action-btn
{
	width: auto;
	white-space: nowrap;
}

/* Inputs */
.pict-objecteditor[data-theme="mytheme"] .pict-oe-value-input { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-value-input:focus { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-key-input { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-key-input:focus { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-type-select { }
.pict-objecteditor[data-theme="mytheme"] .pict-oe-type-select:focus { }
```

### 2. Apply the Theme

```javascript
document.querySelector('.pict-objecteditor').setAttribute('data-theme', 'mytheme');
```

### 3. Key Styling Notes

- **Root add buttons** must have `width: auto; white-space: nowrap;` to prevent text wrapping in themes that constrain `.pict-oe-action-btn` dimensions.
- **Action button opacity** is controlled by `.pict-oe-actions` (default `0.4`, becomes `1` on row hover). Override this if you want buttons always visible.
- **String quote marks** are rendered via `::before` and `::after` pseudo-elements on `.pict-oe-value-string`. Style these separately from the string color.
- **Alternating rows** (like Spreadsheet theme) can use `.pict-oe-row:nth-child(even)`.
- **The container** has `overflow: auto; max-height: 600px` by default. Override these for different scroll behavior.

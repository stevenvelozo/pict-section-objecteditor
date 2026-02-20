# Configuration Reference

The Object Editor accepts configuration through the standard Pict view options pattern. Default values come from `Pict-Section-ObjectEditor-DefaultConfiguration.js` and can be overridden when registering the view.

## View Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ViewIdentifier` | string | `'Pict-ObjectEditor'` | Identifier for debugging and view registry |
| `DefaultRenderable` | string | `'ObjectEditor-Container'` | Hash of the default renderable |
| `DefaultDestinationAddress` | string | `'#ObjectEditor-Container'` | CSS selector where the container renders |
| `AutoRender` | boolean | `false` | Whether to auto-render when the application loads |
| `ObjectDataAddress` | string | `false` | Dot-path to the JSON data in the Fable instance (e.g. `'AppData.Config'`) |
| `InitialExpandDepth` | number | `1` | How many levels deep to auto-expand on first render |
| `Editable` | boolean | `true` | Enable editing UI (inline edit, add/remove buttons). Set `false` for read-only inspector mode. |
| `ShowTypeIndicators` | boolean | `true` | Show type badges (`obj`, `arr`) on container nodes |
| `IndentPixels` | number | `20` | Pixels of indentation per depth level |
| `CSS` | string | *(built-in styles)* | CSS injected via `pict.CSSMap`. Override or extend to change the look. |
| `MacroTemplates` | object | *(see below)* | Jellyfish template strings for each HTML fragment |
| `Templates` | array | *(see below)* | Per-type Jellyfish templates that compose macros |
| `Renderables` | array | *(see below)* | Standard Pict renderable definitions |

## ObjectDataAddress

This is the most important configuration option. It tells the editor where to find the JSON data within the Fable service instance. The path is resolved by splitting on `.` and walking properties starting from `this.fable`:

```javascript
// ObjectDataAddress: 'AppData.Config'
// resolves to: this.fable.AppData.Config
```

If the address is `false` or the path resolves to `null`/`undefined`, the editor shows a "No data" placeholder.

## Renderables

The default renderable renders the container template into the destination element:

```javascript
Renderables:
[
	{
		RenderableHash: 'ObjectEditor-Container',
		TemplateHash: 'ObjectEditor-Container-Template',
		DestinationAddress: '#ObjectEditor-Container',
		RenderMethod: 'replace'
	}
]
```

When you use the editor, override `DestinationAddress` to match your page structure. The `RenderableHash` and `TemplateHash` should remain the same unless you are also providing a custom container template.

## MacroTemplates

All HTML fragments are defined as Jellyfish template strings in `MacroTemplates.Node`. These are compiled at render time against the node descriptor (available as `Record`) and the ObjectEditor view instance (available as `Context[0]`).

### Template Variables

When a MacroTemplate is compiled, the following properties are available:

**On `Record` (the node descriptor):**

| Property | Type | Description |
|----------|------|-------------|
| `Path` | string | Full dot/bracket path (e.g. `'server.pool.max'`, `'features[2]'`) |
| `Key` | string | Property name or array index |
| `Depth` | number | Nesting depth (0 = top level) |
| `DataType` | string | One of: `string`, `number`, `boolean`, `null`, `object`, `array` |
| `HasChildren` | boolean | Whether this node has child nodes (containers only) |
| `ChildCount` | number | Number of children (containers only) |
| `IsExpanded` | boolean | Whether the node is currently expanded |
| `IsArrayElement` | boolean | Whether this node is an element of an array |
| `ArrayIndex` | number | Numeric index if array element, otherwise `-1` |
| `PaddingLeft` | number | Computed left padding in pixels |
| `EscapedPath` | string | HTML-attribute-escaped path |
| `EscapedKey` | string | HTML-escaped key name |
| `ToggleArrow` | string | `'▼'` if expanded, `'▶'` if collapsed |
| `EscapedArrayPath` | string | Escaped parent array path (for move buttons) |
| `EscapedValue` | string | HTML-escaped display value (leaf nodes) |
| `EscapedTitle` | string | HTML-attribute-escaped full value (strings, for tooltip) |
| `DisplayValue` | string | Display-friendly value string (booleans) |
| `TypeLabel` | string | Type label text (containers, e.g. `'obj'`, `'arr'`) |
| `SummaryText` | string | Summary text (containers, e.g. `'{3 keys}'`, `'[5 items]'`) |

**On `Context[0]` (the ObjectEditor view):**

| Property | Type | Description |
|----------|------|-------------|
| `Hash` | string | The view's service hash, used in `onclick` handlers |

**Global:**

| Expression | Description |
|------------|-------------|
| `{~P~}` | Resolves to `'_Pict'` (the global Pict variable name) |

### Default MacroTemplates

```javascript
MacroTemplates:
{
	Node:
	{
		RowOpen: '<div class="pict-oe-row" ...>',
		RowClose: '</div>',
		Toggle: '<span class="pict-oe-toggle" onclick="...">{~D:Record.ToggleArrow~}</span>',
		Spacer: '<span class="pict-oe-spacer"></span>',
		KeyName: '<span class="pict-oe-key">{~D:Record.EscapedKey~}</span>',
		KeyIndex: '<span class="pict-oe-key"><span class="pict-oe-array-index">{~D:Record.ArrayIndex~}</span></span>',
		Separator: '<span class="pict-oe-separator">:</span>',
		TypeBadge: '<span class="pict-oe-type-badge">{~D:Record.TypeLabel~}</span>',
		Summary: '<span class="pict-oe-summary">{~D:Record.SummaryText~}</span>',
		ValueStringEditable: '<span class="pict-oe-value pict-oe-value-string" ondblclick="...">...</span>',
		ValueStringReadOnly: '<span class="pict-oe-value pict-oe-value-string">...</span>',
		ValueNumberEditable: '<span class="pict-oe-value pict-oe-value-number" ondblclick="...">...</span>',
		ValueNumberReadOnly: '<span class="pict-oe-value pict-oe-value-number">...</span>',
		ValueBooleanEditable: '<span class="pict-oe-value pict-oe-value-boolean" onclick="...">...</span>',
		ValueBooleanReadOnly: '<span class="pict-oe-value pict-oe-value-boolean">...</span>',
		ValueNull: '<span class="pict-oe-value pict-oe-value-null">null</span>',
		ActionsOpen: '<span class="pict-oe-actions">',
		ActionsClose: '</span>',
		ButtonRemove: '<span class="pict-oe-action-btn pict-oe-action-remove" onclick="...">x</span>',
		ButtonAddObject: '<span class="pict-oe-action-btn pict-oe-action-add" onclick="...">+</span>',
		ButtonAddArray: '<span class="pict-oe-action-btn pict-oe-action-add" onclick="...">+</span>',
		ButtonMoveUp: '<span class="pict-oe-action-btn pict-oe-action-move" onclick="...">up</span>',
		ButtonMoveDown: '<span class="pict-oe-action-btn pict-oe-action-move" onclick="...">down</span>',
		RootAddObject: '<div class="pict-oe-root-add">... + add property ...</div>',
		RootAddArray: '<div class="pict-oe-root-add">... + add element ...</div>'
	}
}
```

### Overriding a MacroTemplate

To change how a specific element renders, override just that macro in your view configuration:

```javascript
pict.addView('MyEditor',
{
	ObjectDataAddress: 'AppData.Data',
	DefaultDestinationAddress: '#editor',
	MacroTemplates:
	{
		Node:
		{
			// Custom separator with an arrow instead of a colon
			Separator: '<span class="pict-oe-separator"> => </span>',

			// Custom type badge with emoji
			TypeBadge: '<span class="pict-oe-type-badge">{~D:Record.TypeLabel~} icon</span>'
		}
	},
	Renderables: [...]
},
libPictSectionObjectEditor);
```

Note: when you override `MacroTemplates.Node`, it merges with the defaults at the top level. To override individual macros, provide just the ones you want to change.

## Per-Type Templates

The `Templates` array contains Jellyfish templates for the container and each node type. These compose the pre-compiled macros:

```javascript
Templates:
[
	{
		Hash: 'ObjectEditor-Container-Template',
		Template: '<div class="pict-objecteditor" id="ObjectEditor-Tree-{~D:Context[0].Hash~}"></div>'
	},
	{
		Hash: 'ObjectEditor-Node-String',
		Template: '{~D:Record.Macro.RowOpen~}{~D:Record.Macro.Spacer~}{~D:Record.Macro.Key~}{~D:Record.Macro.Separator~}{~D:Record.Macro.Value~}{~D:Record.Macro.Actions~}{~D:Record.Macro.RowClose~}'
	},
	// Number, Boolean, Null use the same layout as String
	{
		Hash: 'ObjectEditor-Node-Object',
		Template: '{~D:Record.Macro.RowOpen~}{~D:Record.Macro.Toggle~}{~D:Record.Macro.Key~}{~D:Record.Macro.TypeBadge~}{~D:Record.Macro.Summary~}{~D:Record.Macro.Actions~}{~D:Record.Macro.RowClose~}'
	},
	// Array uses the same layout as Object
]
```

Leaf nodes (String, Number, Boolean, Null) show: spacer, key, separator, value, actions.

Container nodes (Object, Array) show: toggle arrow, key, type badge, summary, actions.

## Example: Custom Configuration

```javascript
const customConfig = (
{
	ViewIdentifier: 'MyCustomEditor',
	DefaultDestinationAddress: '#custom-editor',
	ObjectDataAddress: 'AppData.Settings',
	InitialExpandDepth: 3,
	Editable: true,
	ShowTypeIndicators: false,
	IndentPixels: 24,
	Renderables:
	[
		{
			RenderableHash: 'ObjectEditor-Container',
			TemplateHash: 'ObjectEditor-Container-Template',
			DestinationAddress: '#custom-editor',
			RenderMethod: 'replace'
		}
	]
});
```

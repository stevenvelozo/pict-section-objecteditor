# Usage in Plain JavaScript

You can use the Object Editor in any web page without building a full Pict application. This guide covers standalone usage with the Pict browser bundle.

## Prerequisites

You need the Pict browser bundle (`pict.min.js`) and a Browserified bundle of the object editor. The easiest way to produce the editor bundle is with Quackage:

```bash
npm install pict-section-objecteditor quackage
npx quack build
```

Or use the pre-built bundle from the example application at `example_applications/json_editor/dist/`.

## Minimal Example

```html
<!doctype html>
<html>
<head>
	<!-- Required: Pict injects CSS into this element -->
	<style id="PICT-CSS"></style>

	<!-- Pict core library -->
	<script src="pict.min.js"></script>
</head>
<body>
	<div id="my-editor"></div>

	<!-- Your Browserified bundle that includes the object editor -->
	<script src="my-editor-bundle.min.js"></script>

	<script>
		// The global _Pict instance is created by Pict.safeLoadPictApplication
		// or you can create one manually:
		var pict = new Pict({ Product: 'My-Editor' });
		pict.AppData.MyObject =
		{
			name: 'Widget',
			version: 3,
			enabled: true,
			tags: ['ui', 'editor'],
			config:
			{
				color: '#3366CC',
				size: 'medium',
				nested: { deep: true }
			},
			metadata: null
		};

		// Register the object editor as a view
		var ObjectEditor = require('pict-section-objecteditor');
		pict.addView('ObjectEditor',
			{
				ViewIdentifier: 'ObjectEditor',
				DefaultDestinationAddress: '#my-editor',
				ObjectDataAddress: 'AppData.MyObject',
				InitialExpandDepth: 1,
				Editable: true,
				ShowTypeIndicators: true,
				Renderables: [
					{
						RenderableHash: 'ObjectEditor-Container',
						TemplateHash: 'ObjectEditor-Container-Template',
						DestinationAddress: '#my-editor',
						RenderMethod: 'replace'
					}
				]
			},
			ObjectEditor);

		// Initialize and render
		pict.views.ObjectEditor.render();
	</script>
</body>
</html>
```

## Using the Application Pattern

For a cleaner setup, wrap the editor in a small Pict application:

```javascript
// my-editor-app.js
var libPictApplication = require('pict-application');
var libPictSectionObjectEditor = require('pict-section-objecteditor');

class MyEditorApp extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.pict.addView('Editor',
			{
				ViewIdentifier: 'Editor',
				DefaultDestinationAddress: '#editor',
				ObjectDataAddress: 'AppData.Data',
				InitialExpandDepth: 1,
				Editable: true,
				ShowTypeIndicators: true,
				Renderables: [
					{
						RenderableHash: 'ObjectEditor-Container',
						TemplateHash: 'ObjectEditor-Container-Template',
						DestinationAddress: '#editor',
						RenderMethod: 'replace'
					}
				]
			},
			libPictSectionObjectEditor);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
		this.pict.views.Editor.render();
	}
}

module.exports = MyEditorApp;

module.exports.default_configuration = (
{
	Name: 'Editor',
	Hash: 'EditorApp',
	MainViewportViewIdentifier: 'Editor',
	pict_configuration:
	{
		Product: 'Editor',
		DefaultAppData:
		{
			Data: { hello: 'world' }
		}
	}
});
```

Then in your HTML:

```html
<!doctype html>
<html>
<head>
	<style id="PICT-CSS"></style>
	<script src="pict.min.js"></script>
	<script>
		Pict.safeOnDocumentReady(() =>
		{
			Pict.safeLoadPictApplication(MyEditorApp, 1);
		});
	</script>
</head>
<body>
	<div id="editor"></div>
	<script src="my-editor-app.min.js"></script>
</body>
</html>
```

## Toolbar Controls

Add buttons to control the editor from outside:

```html
<div class="toolbar">
	<button onclick="_Pict.views.Editor.expandAll()">Expand All</button>
	<button onclick="_Pict.views.Editor.collapseAll()">Collapse All</button>
	<button onclick="_Pict.views.Editor.expandToDepth(1)">Depth 1</button>
	<button onclick="_Pict.views.Editor.expandToDepth(2)">Depth 2</button>
	<button onclick="_Pict.views.Editor.expandToDepth(3)">Depth 3</button>
</div>
<div id="editor"></div>
```

## Loading External JSON

Fetch JSON from an API and display it in the editor:

```javascript
fetch('/api/config')
	.then(function(response) { return response.json(); })
	.then(function(data)
	{
		_Pict.AppData.Data = data;
		_Pict.views.Editor.renderTree();
	});
```

## Extracting Edited Data

The editor mutates `AppData` directly. To get the current state:

```javascript
// Read the live data back out
var currentData = _Pict.AppData.Data;
var jsonString = JSON.stringify(currentData, null, '\t');

// Send it somewhere
fetch('/api/config',
{
	method: 'PUT',
	headers: { 'Content-Type': 'application/json' },
	body: jsonString
});
```

## Building with Quackage

Create a `package.json` for your editor page:

```json
{
	"name": "my-editor",
	"version": "1.0.0",
	"main": "source/my-editor-app.js",
	"scripts": {
		"build": "npx quack build"
	},
	"dependencies": {
		"pict": "^1.0.348",
		"pict-application": "^1.0.0",
		"pict-section-objecteditor": "^0.0.1"
	},
	"devDependencies": {
		"quackage": "^1.0.51"
	}
}
```

Then:

```bash
npm install
npm run build
```

This produces `my-editor-app.js` and `my-editor-app.min.js` in your project root.

## The PICT-CSS Style Element

The Object Editor injects its CSS into a `<style>` element with `id="PICT-CSS"`. This element **must exist** in your HTML before the editor renders. If it is missing, the editor will render structurally but without styling.

```html
<style id="PICT-CSS"></style>
```

This is the standard Pict convention. All Pict views that use `pict.CSSMap` write their styles to this shared element.

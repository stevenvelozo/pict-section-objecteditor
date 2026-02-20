# Usage in a Pict Application

This guide shows how to integrate the Object Editor into a Pict application using views, AppData, and the standard Pict lifecycle.

## Prerequisites

```bash
npm install pict pict-application pict-section-objecteditor
```

## Basic Setup

### 1. Create a View Class

Extend the Object Editor and configure it for your data:

```javascript
const libPictApplication = require('pict-application');
const libPictSectionObjectEditor = require('pict-section-objecteditor');

class ConfigEditorView extends libPictSectionObjectEditor
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}
```

### 2. Define Configuration

The editor needs to know where your data lives in `AppData` and where to render:

```javascript
const ConfigEditorConfiguration = (
{
	ViewIdentifier: 'ConfigEditor',
	DefaultDestinationAddress: '#config-editor',
	ObjectDataAddress: 'AppData.Config',
	InitialExpandDepth: 2,
	Editable: true,
	ShowTypeIndicators: true,
	Renderables:
	[
		{
			RenderableHash: 'ObjectEditor-Container',
			TemplateHash: 'ObjectEditor-Container-Template',
			DestinationAddress: '#config-editor',
			RenderMethod: 'replace'
		}
	]
});
```

### 3. Create the Application

Register the view with your Pict application:

```javascript
class MyApp extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView(
			'ConfigEditor',
			ConfigEditorConfiguration,
			ConfigEditorView
		);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
		this.pict.views.ConfigEditor.render();
	}
}

module.exports = MyApp;

module.exports.default_configuration = (
{
	Name: 'Config Editor',
	Hash: 'ConfigEditorApp',
	MainViewportViewIdentifier: 'ConfigEditor',
	pict_configuration:
	{
		Product: 'Config-Editor',
		DefaultAppData:
		{
			Config:
			{
				server:
				{
					host: 'localhost',
					port: 8080,
					debug: false
				},
				features: ['auth', 'logging', 'cache'],
				database:
				{
					host: 'db.example.com',
					port: 5432,
					name: 'myapp',
					ssl: true,
					pool: { min: 2, max: 10 },
					credentials: null
				}
			}
		}
	}
});
```

### 4. HTML Page

```html
<!doctype html>
<html>
<head>
	<style id="PICT-CSS"></style>
	<script src="pict.min.js"></script>
	<script>
		Pict.safeOnDocumentReady(() =>
		{
			Pict.safeLoadPictApplication(MyApp, 1);
		});
	</script>
</head>
<body>
	<div id="config-editor"></div>
	<script src="my-app.min.js"></script>
</body>
</html>
```

The `<style id="PICT-CSS"></style>` element is required -- the editor injects its CSS there via `pict.CSSMap.injectCSS()`.

## Read-Only Inspector Mode

Set `Editable: false` to use the editor as a read-only data inspector. All action buttons, inline editing, and add/remove UI will be suppressed:

```javascript
const InspectorConfiguration = (
{
	ViewIdentifier: 'DataInspector',
	DefaultDestinationAddress: '#inspector',
	ObjectDataAddress: 'AppData.ResponseData',
	InitialExpandDepth: 1,
	Editable: false,
	ShowTypeIndicators: true,
	Renderables:
	[
		{
			RenderableHash: 'ObjectEditor-Container',
			TemplateHash: 'ObjectEditor-Container-Template',
			DestinationAddress: '#inspector',
			RenderMethod: 'replace'
		}
	]
});
```

## Controlling the Editor Programmatically

Once the view is rendered, you can call its public API:

```javascript
let tmpEditor = _Pict.views.ConfigEditor;

// Expand/collapse
tmpEditor.expandAll();
tmpEditor.collapseAll();
tmpEditor.expandToDepth(3);

// Mutate data
tmpEditor.addObjectProperty('server', 'timeout', 30000);
tmpEditor.addArrayElement('features', 'websockets');
tmpEditor.setValueAtPath('server.port', 3000);
tmpEditor.removeNode('server.debug');

// Array reorder
tmpEditor.moveArrayElementUp('features', 2);
tmpEditor.moveArrayElementDown('features', 0);
```

## Multiple Editors on One Page

You can register multiple independent editor views, each pointing at different data:

```javascript
this.pict.addView('ServerConfigEditor',
	{
		ViewIdentifier: 'ServerConfigEditor',
		DefaultDestinationAddress: '#server-config',
		ObjectDataAddress: 'AppData.Config.server',
		Editable: true,
		Renderables: [
			{
				RenderableHash: 'ObjectEditor-Container',
				TemplateHash: 'ObjectEditor-Container-Template',
				DestinationAddress: '#server-config',
				RenderMethod: 'replace'
			}
		]
	},
	libPictSectionObjectEditor);

this.pict.addView('DatabaseConfigEditor',
	{
		ViewIdentifier: 'DatabaseConfigEditor',
		DefaultDestinationAddress: '#db-config',
		ObjectDataAddress: 'AppData.Config.database',
		Editable: true,
		Renderables: [
			{
				RenderableHash: 'ObjectEditor-Container',
				TemplateHash: 'ObjectEditor-Container-Template',
				DestinationAddress: '#db-config',
				RenderMethod: 'replace'
			}
		]
	},
	libPictSectionObjectEditor);
```

## Working with Data Changes

The Object Editor mutates AppData directly. If you need to react to changes, you can override the `renderTree` method:

```javascript
class ConfigEditorView extends libPictSectionObjectEditor
{
	renderTree()
	{
		super.renderTree();

		// The data at AppData.Config has been modified and the tree re-rendered
		let tmpCurrentData = this._resolveObjectData();
		console.log('Config updated:', JSON.stringify(tmpCurrentData));
	}
}
```

## Building for the Browser

Use Quackage to produce a Browserified bundle:

```bash
npx quack build
```

This reads your `package.json` entry point and produces debug and minified bundles. See the `example_applications/json_editor/` directory for a complete working example.

const libPictApplication = require('pict-application');

const libPictSectionObjectEditor = require('../../source/Pict-Section-ObjectEditor.js');

class ExampleObjectEditorView extends libPictSectionObjectEditor
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

const ExampleObjectEditorConfiguration = (
{
	"ViewIdentifier": "ExampleObjectEditor",
	"DefaultDestinationAddress": "#ObjectEditorContainer",
	"ObjectDataAddress": "AppData.ConfigData",
	"InitialExpandDepth": 2,
	"Editable": true,
	"ShowTypeIndicators": true,
	"Renderables":
	[
		{
			"RenderableHash": "ObjectEditor-Container",
			"TemplateHash": "ObjectEditor-Container-Template",
			"DestinationAddress": "#ObjectEditorContainer",
			"RenderMethod": "replace"
		}
	]
});

class ObjectEditorExampleApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('ExampleObjectEditorView', ExampleObjectEditorConfiguration, ExampleObjectEditorView);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();

		let tmpView = this.pict.views.ExampleObjectEditorView;
		if (tmpView)
		{
			tmpView.render();
		}
	}
}

module.exports = ObjectEditorExampleApplication;

module.exports.default_configuration = (
{
	"Name": "Object Editor Example",
	"Hash": "ObjectEditorExample",

	"MainViewportViewIdentifier": "ExampleObjectEditorView",

	"pict_configuration":
	{
		"Product": "ObjectEditor-Example",

		"DefaultAppData":
		{
			"ConfigData":
			{
				"application":
				{
					"name": "Retold Documentation Server",
					"version": "2.1.0",
					"debug": false,
					"port": 8080,
					"maxConnections": 1000,
					"features": ["markdown", "mermaid", "search", "syntax-highlight"],
					"database":
					{
						"host": "localhost",
						"port": 5432,
						"name": "retold_docs",
						"ssl": true,
						"pool": { "min": 2, "max": 10 },
						"credentials": null
					},
					"logging":
					{
						"level": "info",
						"format": "json",
						"colorize": true,
						"destinations":
						[
							{ "type": "console", "enabled": true },
							{ "type": "file", "path": "/var/log/retold.log", "enabled": false, "maxSize": "10MB" }
						]
					},
					"cache":
					{
						"enabled": true,
						"ttl": 3600,
						"maxItems": 500,
						"strategy": "lru"
					},
					"metadata":
					{
						"createdAt": "2024-01-15T08:30:00Z",
						"author": "Steven Velozo",
						"tags": ["documentation", "api", "fable", "open-source"],
						"license": "MIT"
					}
				}
			}
		}
	}
});

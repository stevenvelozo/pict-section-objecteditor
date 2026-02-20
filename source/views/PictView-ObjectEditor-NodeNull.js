const libPictViewObjectEditorNode = require('./PictView-ObjectEditor-Node.js');

class PictViewObjectEditorNodeNull extends libPictViewObjectEditorNode
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'PictViewObjectEditorNodeNull';
	}

	renderNodeHTML(pNode, pValue, pOptions)
	{
		// Compile all MacroTemplates onto pNode.Macro
		this.compileMacros(pNode, pValue, pOptions);

		// Null always uses the static ValueNull macro
		pNode.Macro.Value = pNode.Macro.ValueNull;

		// Compose actions
		pNode.Macro.Actions = this.compileActions(pNode, pOptions);

		// Render via per-type template
		return this.pict.parseTemplate(
			this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Null'),
			pNode,
			null,
			[this._ObjectEditorView]
		);
	}
}

module.exports = PictViewObjectEditorNodeNull;

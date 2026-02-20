const libPictViewObjectEditorNode = require('./PictView-ObjectEditor-Node.js');

class PictViewObjectEditorNodeBoolean extends libPictViewObjectEditorNode
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'PictViewObjectEditorNodeBoolean';
	}

	renderNodeHTML(pNode, pValue, pOptions)
	{
		// Set type-specific display properties on the node descriptor
		pNode.DisplayValue = pValue ? 'true' : 'false';

		// Compile all MacroTemplates onto pNode.Macro
		this.compileMacros(pNode, pValue, pOptions);

		// Select editable or read-only value macro
		pNode.Macro.Value = pOptions.Editable ? pNode.Macro.ValueBooleanEditable : pNode.Macro.ValueBooleanReadOnly;

		// Compose actions
		pNode.Macro.Actions = this.compileActions(pNode, pOptions);

		// Render via per-type template
		return this.pict.parseTemplate(
			this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Boolean'),
			pNode,
			null,
			[this._ObjectEditorView]
		);
	}
}

module.exports = PictViewObjectEditorNodeBoolean;

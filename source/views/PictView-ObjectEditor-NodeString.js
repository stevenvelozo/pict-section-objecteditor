const libPictViewObjectEditorNode = require('./PictView-ObjectEditor-Node.js');

class PictViewObjectEditorNodeString extends libPictViewObjectEditorNode
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'PictViewObjectEditorNodeString';
	}

	renderNodeHTML(pNode, pValue, pOptions)
	{
		// Set type-specific display properties on the node descriptor
		let tmpDisplayValue = (typeof pValue === 'string') ? pValue : '';
		// Truncate long strings for display
		let tmpTruncated = tmpDisplayValue.length > 120 ? tmpDisplayValue.substring(0, 120) + '\u2026' : tmpDisplayValue;
		pNode.EscapedValue = this.escapeHTML(tmpTruncated);
		pNode.EscapedTitle = this.escapeAttribute(tmpDisplayValue);

		// Compile all MacroTemplates onto pNode.Macro
		this.compileMacros(pNode, pValue, pOptions);

		// Select editable or read-only value macro
		pNode.Macro.Value = pOptions.Editable ? pNode.Macro.ValueStringEditable : pNode.Macro.ValueStringReadOnly;

		// Compose actions
		pNode.Macro.Actions = this.compileActions(pNode, pOptions);

		// Render via per-type template
		return this.pict.parseTemplate(
			this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-String'),
			pNode,
			null,
			[this._ObjectEditorView]
		);
	}
}

module.exports = PictViewObjectEditorNodeString;

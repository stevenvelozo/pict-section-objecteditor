const libPictViewObjectEditorNode = require('./PictView-ObjectEditor-Node.js');

class PictViewObjectEditorNodeArray extends libPictViewObjectEditorNode
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'PictViewObjectEditorNodeArray';
	}

	renderNodeHTML(pNode, pValue, pOptions)
	{
		// Set type-specific display properties on the node descriptor
		let tmpLength = Array.isArray(pValue) ? pValue.length : 0;

		pNode.TypeLabel = 'Array';
		let tmpNoun = (tmpLength === 1) ? 'item' : 'items';
		pNode.SummaryText = '[' + tmpLength + ' ' + tmpNoun + ']';

		// Compile all MacroTemplates onto pNode.Macro
		this.compileMacros(pNode, pValue, pOptions);

		// Compose container actions (includes add button)
		pNode.Macro.Actions = this.compileContainerActions(pNode, pOptions, 'array');

		// Render via per-type template
		return this.pict.parseTemplate(
			this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Array'),
			pNode,
			null,
			[this._ObjectEditorView]
		);
	}
}

module.exports = PictViewObjectEditorNodeArray;

const libPictViewObjectEditorNode = require('./PictView-ObjectEditor-Node.js');

class PictViewObjectEditorNodeObject extends libPictViewObjectEditorNode
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'PictViewObjectEditorNodeObject';
	}

	renderNodeHTML(pNode, pValue, pOptions)
	{
		// Set type-specific display properties on the node descriptor
		let tmpKeyCount = 0;
		if (pValue && typeof pValue === 'object' && !Array.isArray(pValue))
		{
			tmpKeyCount = Object.keys(pValue).length;
		}

		pNode.TypeLabel = 'Object';
		let tmpNoun = (tmpKeyCount === 1) ? 'key' : 'keys';
		pNode.SummaryText = '{' + tmpKeyCount + ' ' + tmpNoun + '}';

		// Compile all MacroTemplates onto pNode.Macro
		this.compileMacros(pNode, pValue, pOptions);

		// Compose container actions (includes add button)
		pNode.Macro.Actions = this.compileContainerActions(pNode, pOptions, 'object');

		// Render via per-type template
		return this.pict.parseTemplate(
			this.pict.TemplateProvider.getTemplate('ObjectEditor-Node-Object'),
			pNode,
			null,
			[this._ObjectEditorView]
		);
	}
}

module.exports = PictViewObjectEditorNodeObject;

const libPictView = require('pict-view');

/**
 * Base class for all object editor node type renderers.
 *
 * Each subclass implements renderNodeHTML() to return an HTML string
 * for a single tree row.  One instance per type, not per node.
 *
 * Rendering uses the Pict template system with MacroTemplates defined
 * in the view configuration.  Each macro is a Jellyfish template string
 * compiled against the node descriptor (Record) and the ObjectEditor
 * view (Context[0]).  Subclasses set type-specific properties on the
 * node descriptor, call compileMacros(), then resolve a per-type
 * template that references the compiled macros.
 */
class PictViewObjectEditorNode extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this.serviceType = 'PictViewObjectEditorNode';

		// Reference to the parent ObjectEditor view; set by the orchestrator
		this._ObjectEditorView = null;
	}

	/**
	 * Render a single tree node row as an HTML string.
	 *
	 * @param {Object} pNode - Node descriptor { Path, Key, Depth, DataType, HasChildren, ChildCount, IsExpanded, IsArrayElement, ArrayIndex }
	 * @param {*} pValue - The actual value at this node's path
	 * @param {Object} pOptions - Editor options { Editable, ShowTypeIndicators, IndentPixels, ViewHash }
	 *
	 * @return {string} HTML string for this row
	 */
	renderNodeHTML(pNode, pValue, pOptions)
	{
		return '';
	}

	// --- Macro compilation ---

	/**
	 * Compile all MacroTemplates onto pNode.Macro.
	 *
	 * This sets computed display properties on the node descriptor,
	 * then resolves every MacroTemplate from the view configuration
	 * against the node (as Record) and the ObjectEditor view (as Context[0]).
	 *
	 * After this call, pNode.Macro contains the compiled HTML fragments
	 * ready to be composed by a per-type template.
	 */
	compileMacros(pNode, pValue, pOptions)
	{
		// Compute derived display properties on the node descriptor
		pNode.PaddingLeft = (pNode.Depth * pOptions.IndentPixels) + 12;
		pNode.EscapedPath = this.escapeAttribute(pNode.Path);
		pNode.EscapedKey = this.escapeHTML(String(pNode.Key));
		pNode.ToggleArrow = pNode.IsExpanded ? '\u25BC' : '\u25B6';

		// Parse out parent array path for move buttons
		let tmpBracketMatch = pNode.Path.match(/^(.*)\[(\d+)\]$/);
		if (tmpBracketMatch)
		{
			pNode.EscapedArrayPath = this.escapeAttribute(tmpBracketMatch[1]);
		}
		else
		{
			pNode.EscapedArrayPath = '';
		}

		// Compile each MacroTemplate onto pNode.Macro
		let tmpMacroTemplates = this._ObjectEditorView.options.MacroTemplates.Node;
		let tmpMacroKeys = Object.keys(tmpMacroTemplates);
		pNode.Macro = {};

		for (let i = 0; i < tmpMacroKeys.length; i++)
		{
			let tmpKey = tmpMacroKeys[i];
			pNode.Macro[tmpKey] = this.pict.parseTemplate(
				tmpMacroTemplates[tmpKey],
				pNode,
				null,
				[this._ObjectEditorView]
			);
		}

		// Set the Key macro conditionally: array index or key name
		if (pNode.IsArrayElement)
		{
			pNode.Macro.Key = pNode.Macro.KeyIndex;
		}
		else
		{
			pNode.Macro.Key = pNode.Macro.KeyName;
		}

		// Set TypeBadge to empty if ShowTypeIndicators is false
		if (!pOptions.ShowTypeIndicators)
		{
			pNode.Macro.TypeBadge = '';
		}
	}

	/**
	 * Compose action button macros for leaf nodes.
	 * Returns a compiled HTML string for the actions area.
	 */
	compileActions(pNode, pOptions)
	{
		if (!pOptions.Editable)
		{
			return '';
		}
		let tmpHTML = pNode.Macro.ActionsOpen;
		if (pNode.IsArrayElement)
		{
			tmpHTML += pNode.Macro.ButtonMoveUp + pNode.Macro.ButtonMoveDown;
		}
		tmpHTML += pNode.Macro.ButtonRemove;
		tmpHTML += pNode.Macro.ActionsClose;
		return tmpHTML;
	}

	/**
	 * Compose action button macros for container nodes (object/array).
	 * Includes an add button in addition to move and remove.
	 */
	compileContainerActions(pNode, pOptions, pContainerType)
	{
		if (!pOptions.Editable)
		{
			return '';
		}
		let tmpHTML = pNode.Macro.ActionsOpen;
		tmpHTML += (pContainerType === 'array') ? pNode.Macro.ButtonAddArray : pNode.Macro.ButtonAddObject;
		if (pNode.IsArrayElement)
		{
			tmpHTML += pNode.Macro.ButtonMoveUp + pNode.Macro.ButtonMoveDown;
		}
		tmpHTML += pNode.Macro.ButtonRemove;
		tmpHTML += pNode.Macro.ActionsClose;
		return tmpHTML;
	}

	/**
	 * Escape a string for safe use in HTML attributes.
	 */
	escapeAttribute(pString)
	{
		if (typeof pString !== 'string')
		{
			return '';
		}
		return pString.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	/**
	 * Escape a string for safe use in HTML content.
	 */
	escapeHTML(pString)
	{
		if (typeof pString !== 'string')
		{
			return '';
		}
		return pString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}
}

module.exports = PictViewObjectEditorNode;

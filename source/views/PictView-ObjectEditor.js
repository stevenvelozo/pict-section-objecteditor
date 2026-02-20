const libPictView = require('pict-view');

const libNodeString = require('./PictView-ObjectEditor-NodeString.js');
const libNodeNumber = require('./PictView-ObjectEditor-NodeNumber.js');
const libNodeBoolean = require('./PictView-ObjectEditor-NodeBoolean.js');
const libNodeNull = require('./PictView-ObjectEditor-NodeNull.js');
const libNodeObject = require('./PictView-ObjectEditor-NodeObject.js');
const libNodeArray = require('./PictView-ObjectEditor-NodeArray.js');

const _DefaultConfiguration = require('../Pict-Section-ObjectEditor-DefaultConfiguration.js');

class PictViewObjectEditor extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DefaultConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.initialRenderComplete = false;

		// Set of expanded path strings
		this._ExpandedPaths = new Set();

		// Map of data type -> node renderer instance
		this._NodeRenderers = {};
	}

	onBeforeInitialize()
	{
		super.onBeforeInitialize();

		// Register node type service types if they aren't already present
		let tmpNodeTypes =
		{
			'PictViewObjectEditorNodeString': libNodeString,
			'PictViewObjectEditorNodeNumber': libNodeNumber,
			'PictViewObjectEditorNodeBoolean': libNodeBoolean,
			'PictViewObjectEditorNodeNull': libNodeNull,
			'PictViewObjectEditorNodeObject': libNodeObject,
			'PictViewObjectEditorNodeArray': libNodeArray
		};

		let tmpNodeTypeKeys = Object.keys(tmpNodeTypes);
		for (let i = 0; i < tmpNodeTypeKeys.length; i++)
		{
			let tmpKey = tmpNodeTypeKeys[i];
			if (!this.fable.servicesMap.hasOwnProperty(tmpKey))
			{
				this.fable.addServiceType(tmpKey, tmpNodeTypes[tmpKey]);
			}
		}

		// Instantiate one renderer per data type
		this._NodeRenderers.string = this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeString');
		this._NodeRenderers.number = this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeNumber');
		this._NodeRenderers.boolean = this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeBoolean');
		this._NodeRenderers.null = this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeNull');
		this._NodeRenderers.object = this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeObject');
		this._NodeRenderers.array = this.fable.instantiateServiceProviderWithoutRegistration('PictViewObjectEditorNodeArray');

		// Set back-references on each renderer
		let tmpRendererKeys = Object.keys(this._NodeRenderers);
		for (let i = 0; i < tmpRendererKeys.length; i++)
		{
			this._NodeRenderers[tmpRendererKeys[i]]._ObjectEditorView = this;
		}

		return super.onBeforeInitialize();
	}

	onAfterRender()
	{
		super.onAfterRender();

		// Ensure the CSS from all registered views is injected into the DOM
		this.pict.CSSMap.injectCSS();

		if (!this.initialRenderComplete)
		{
			this.initialRenderComplete = true;
			this.onAfterInitialRender();
		}

		// Always re-populate the tree after any render, since the container
		// template may have been re-rendered (e.g., by the application auto-render).
		this.renderTree();
	}

	onAfterInitialRender()
	{
		// Expand to the configured initial depth
		let tmpData = this._resolveObjectData();
		if (tmpData !== null && typeof tmpData === 'object')
		{
			this._expandToDepth(tmpData, '', 0, this.options.InitialExpandDepth);
		}
	}

	// --- Public API ---

	/**
	 * Toggle expand/collapse on a node path.
	 */
	toggleNode(pPath)
	{
		if (this._ExpandedPaths.has(pPath))
		{
			this._ExpandedPaths.delete(pPath);
		}
		else
		{
			this._ExpandedPaths.add(pPath);
		}
		this.renderTree();
	}

	/**
	 * Toggle a boolean value at a path.
	 */
	toggleBoolean(pPath)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}
		let tmpCurrentValue = this._getValueAtPath(tmpData, pPath);
		this._setValueAtPath(tmpData, pPath, !tmpCurrentValue);
		this.renderTree();
	}

	/**
	 * Begin inline editing of a leaf node.
	 */
	beginEdit(pPath, pType)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpCurrentValue = this._getValueAtPath(tmpData, pPath);
		let tmpRowElement = this._getTreeElement().querySelector(`[data-path="${pPath}"]`);
		if (!tmpRowElement)
		{
			return;
		}

		let tmpValueSpan = tmpRowElement.querySelector('.pict-oe-value');
		if (!tmpValueSpan)
		{
			return;
		}

		let tmpInputType = (pType === 'number') ? 'number' : 'text';
		let tmpInputValue = (tmpCurrentValue === null || tmpCurrentValue === undefined) ? '' : String(tmpCurrentValue);
		let tmpEscapedPath = tmpInputValue.replace(/"/g, '&quot;');

		let tmpInput = document.createElement('input');
		tmpInput.type = tmpInputType;
		tmpInput.className = 'pict-oe-value-input';
		tmpInput.value = tmpInputValue;

		let tmpSelf = this;
		let tmpCommit = function()
		{
			let tmpNewValue = tmpInput.value;
			if (pType === 'number')
			{
				tmpNewValue = Number(tmpNewValue);
				if (isNaN(tmpNewValue))
				{
					tmpNewValue = 0;
				}
			}
			tmpSelf._setValueAtPath(tmpData, pPath, tmpNewValue);
			tmpSelf.renderTree();
		};

		tmpInput.addEventListener('blur', tmpCommit);
		tmpInput.addEventListener('keydown', function(pEvent)
		{
			if (pEvent.key === 'Enter')
			{
				tmpInput.blur();
			}
			else if (pEvent.key === 'Escape')
			{
				// Cancel edit, just re-render
				tmpInput.removeEventListener('blur', tmpCommit);
				tmpSelf.renderTree();
			}
		});

		tmpValueSpan.innerHTML = '';
		tmpValueSpan.appendChild(tmpInput);
		tmpInput.focus();
		tmpInput.select();
	}

	/**
	 * Set a value at a dot-path in the object data and re-render.
	 */
	setValueAtPath(pPath, pValue)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}
		this._setValueAtPath(tmpData, pPath, pValue);
		this.renderTree();
	}

	/**
	 * Expand all nodes to a given depth.
	 */
	expandToDepth(pDepth)
	{
		this._ExpandedPaths.clear();
		let tmpData = this._resolveObjectData();
		if (tmpData !== null && typeof tmpData === 'object')
		{
			this._expandToDepth(tmpData, '', 0, pDepth);
		}
		this.renderTree();
	}

	/**
	 * Expand all nodes in the tree.
	 */
	expandAll()
	{
		let tmpData = this._resolveObjectData();
		if (tmpData !== null && typeof tmpData === 'object')
		{
			this._expandToDepth(tmpData, '', 0, Infinity);
		}
		this.renderTree();
	}

	/**
	 * Collapse all nodes in the tree.
	 */
	collapseAll()
	{
		this._ExpandedPaths.clear();
		this.renderTree();
	}

	// --- Add/Remove API ---

	/**
	 * Add a property to an object at a given path.
	 */
	addObjectProperty(pPath, pKey, pDefaultValue)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpTarget = pPath ? this._getValueAtPath(tmpData, pPath) : tmpData;
		if (tmpTarget === null || tmpTarget === undefined || typeof tmpTarget !== 'object' || Array.isArray(tmpTarget))
		{
			return;
		}

		let tmpValue = (pDefaultValue !== undefined) ? pDefaultValue : '';
		tmpTarget[pKey] = tmpValue;

		// Auto-expand the parent so the new property is visible
		if (pPath)
		{
			this._ExpandedPaths.add(pPath);
		}

		this.renderTree();
	}

	/**
	 * Remove a property from an object at a given path.
	 */
	removeObjectProperty(pPath, pKey)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpTarget = pPath ? this._getValueAtPath(tmpData, pPath) : tmpData;
		if (tmpTarget === null || tmpTarget === undefined || typeof tmpTarget !== 'object' || Array.isArray(tmpTarget))
		{
			return;
		}

		let tmpChildPath = pPath ? (pPath + '.' + pKey) : pKey;
		this._cleanupExpandedPaths(tmpChildPath);
		delete tmpTarget[pKey];

		this.renderTree();
	}

	/**
	 * Add an element to the end of an array at a given path.
	 */
	addArrayElement(pPath, pDefaultValue)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpTarget = pPath ? this._getValueAtPath(tmpData, pPath) : tmpData;
		if (!Array.isArray(tmpTarget))
		{
			return;
		}

		let tmpValue = (pDefaultValue !== undefined) ? pDefaultValue : '';
		tmpTarget.push(tmpValue);

		// Auto-expand the parent so the new element is visible
		if (pPath)
		{
			this._ExpandedPaths.add(pPath);
		}

		this.renderTree();
	}

	/**
	 * Remove an element from an array at a given path by index.
	 */
	removeArrayElement(pPath, pIndex)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpTarget = pPath ? this._getValueAtPath(tmpData, pPath) : tmpData;
		if (!Array.isArray(tmpTarget))
		{
			return;
		}

		let tmpIntIndex = parseInt(pIndex, 10);
		if (isNaN(tmpIntIndex) || tmpIntIndex < 0 || tmpIntIndex >= tmpTarget.length)
		{
			return;
		}

		// Clean up expanded paths for the removed element and shift higher indices
		let tmpRemovedPath = pPath ? (pPath + '[' + tmpIntIndex + ']') : ('[' + tmpIntIndex + ']');
		this._cleanupExpandedPaths(tmpRemovedPath);
		this._shiftArrayExpandedPaths(pPath, tmpIntIndex, tmpTarget.length);

		tmpTarget.splice(tmpIntIndex, 1);

		this.renderTree();
	}

	/**
	 * Remove a node from its parent, auto-detecting whether parent is object or array.
	 * Works by parsing the path to find the parent and key/index.
	 */
	removeNode(pPath)
	{
		if (!pPath)
		{
			return;
		}

		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		// Determine if the last segment is a bracket index or a dot key
		let tmpBracketMatch = pPath.match(/^(.*)\[(\d+)\]$/);
		if (tmpBracketMatch)
		{
			// Array element: parent path is the part before [N]
			let tmpParentPath = tmpBracketMatch[1];
			let tmpIndex = parseInt(tmpBracketMatch[2], 10);
			this.removeArrayElement(tmpParentPath, tmpIndex);
		}
		else
		{
			// Object property: parent path is everything before the last dot
			let tmpLastDot = pPath.lastIndexOf('.');
			if (tmpLastDot === -1)
			{
				// Top-level key — parent is root
				let tmpKey = pPath;
				this.removeObjectProperty('', tmpKey);
			}
			else
			{
				let tmpParentPath = pPath.substring(0, tmpLastDot);
				let tmpKey = pPath.substring(tmpLastDot + 1);
				this.removeObjectProperty(tmpParentPath, tmpKey);
			}
		}
	}

	// --- Array Reorder API ---

	/**
	 * Move an array element up by one position (swap with the element before it).
	 * If already at index 0 this is a no-op.
	 */
	moveArrayElementUp(pPath, pIndex)
	{
		let tmpIntIndex = parseInt(pIndex, 10);
		if (isNaN(tmpIntIndex) || tmpIntIndex <= 0)
		{
			return;
		}
		this.moveArrayElementToIndex(pPath, tmpIntIndex, tmpIntIndex - 1);
	}

	/**
	 * Move an array element down by one position (swap with the element after it).
	 * If already at the last index this is a no-op.
	 */
	moveArrayElementDown(pPath, pIndex)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpTarget = pPath ? this._getValueAtPath(tmpData, pPath) : tmpData;
		if (!Array.isArray(tmpTarget))
		{
			return;
		}

		let tmpIntIndex = parseInt(pIndex, 10);
		if (isNaN(tmpIntIndex) || tmpIntIndex < 0 || tmpIntIndex >= tmpTarget.length - 1)
		{
			return;
		}
		this.moveArrayElementToIndex(pPath, tmpIntIndex, tmpIntIndex + 1);
	}

	/**
	 * Move an array element from one index to another.
	 * If pNewIndex is out of bounds it is clamped to [0, length-1].
	 */
	moveArrayElementToIndex(pPath, pFromIndex, pToIndex)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpTarget = pPath ? this._getValueAtPath(tmpData, pPath) : tmpData;
		if (!Array.isArray(tmpTarget))
		{
			return;
		}

		let tmpFrom = parseInt(pFromIndex, 10);
		if (isNaN(tmpFrom) || tmpFrom < 0 || tmpFrom >= tmpTarget.length)
		{
			return;
		}

		let tmpTo = parseInt(pToIndex, 10);
		if (isNaN(tmpTo))
		{
			return;
		}
		// Clamp to valid range
		if (tmpTo < 0)
		{
			tmpTo = 0;
		}
		if (tmpTo >= tmpTarget.length)
		{
			tmpTo = tmpTarget.length - 1;
		}

		if (tmpFrom === tmpTo)
		{
			return;
		}

		// Update expanded paths before mutating the array
		this._moveArrayExpandedPaths(pPath, tmpFrom, tmpTo, tmpTarget.length);

		// Splice the element out and insert at the new position
		let tmpElement = tmpTarget.splice(tmpFrom, 1)[0];
		tmpTarget.splice(tmpTo, 0, tmpElement);

		this.renderTree();
	}

	/**
	 * Begin adding a new property to an object by showing an inline key input
	 * and a type selector dropdown.
	 */
	beginAddToObject(pPath)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpTreeElement = this._getTreeElement();
		if (!tmpTreeElement)
		{
			return;
		}

		let tmpRowElement = tmpTreeElement.querySelector(`[data-path="${pPath}"]`);
		if (!tmpRowElement)
		{
			return;
		}

		// Create an inline input for the key name
		let tmpInput = document.createElement('input');
		tmpInput.type = 'text';
		tmpInput.className = 'pict-oe-key-input';
		tmpInput.placeholder = 'key';

		// Create a type selector dropdown
		let tmpSelect = this._createTypeSelect();

		let tmpSelf = this;
		let tmpCommitted = false;
		let tmpCommit = function()
		{
			if (tmpCommitted)
			{
				return;
			}
			tmpCommitted = true;
			let tmpKey = tmpInput.value.trim();
			if (tmpKey)
			{
				let tmpDefaultValue = tmpSelf._getDefaultValueForType(tmpSelect.value);
				tmpSelf.addObjectProperty(pPath, tmpKey, tmpDefaultValue);
			}
			else
			{
				tmpSelf.renderTree();
			}
		};

		tmpInput.addEventListener('keydown', function(pEvent)
		{
			if (pEvent.key === 'Enter')
			{
				tmpCommit();
			}
			else if (pEvent.key === 'Escape')
			{
				tmpCommitted = true;
				tmpSelf.renderTree();
			}
		});

		tmpSelect.addEventListener('keydown', function(pEvent)
		{
			if (pEvent.key === 'Enter')
			{
				tmpCommit();
			}
			else if (pEvent.key === 'Escape')
			{
				tmpCommitted = true;
				tmpSelf.renderTree();
			}
		});

		// Commit when focus leaves both elements
		let tmpBlurTimeout = null;
		let tmpHandleBlur = function()
		{
			clearTimeout(tmpBlurTimeout);
			tmpBlurTimeout = setTimeout(function()
			{
				// Check if focus moved to the other element in the pair
				if (document.activeElement !== tmpInput && document.activeElement !== tmpSelect)
				{
					tmpCommit();
				}
			}, 150);
		};

		tmpInput.addEventListener('blur', tmpHandleBlur);
		tmpSelect.addEventListener('blur', tmpHandleBlur);

		// Insert before the actions container
		let tmpActionsSpan = tmpRowElement.querySelector('.pict-oe-actions');
		if (tmpActionsSpan)
		{
			tmpRowElement.insertBefore(tmpInput, tmpActionsSpan);
			tmpRowElement.insertBefore(tmpSelect, tmpActionsSpan);
		}
		else
		{
			tmpRowElement.appendChild(tmpInput);
			tmpRowElement.appendChild(tmpSelect);
		}
		tmpInput.focus();
	}

	/**
	 * Begin adding a new element to an array by showing a type selector dropdown.
	 */
	beginAddToArray(pPath)
	{
		let tmpData = this._resolveObjectData();
		if (tmpData === null)
		{
			return;
		}

		let tmpTreeElement = this._getTreeElement();
		if (!tmpTreeElement)
		{
			return;
		}

		let tmpRowElement = tmpTreeElement.querySelector(`[data-path="${pPath}"]`);
		if (!tmpRowElement)
		{
			return;
		}

		// Create a type selector dropdown
		let tmpSelect = this._createTypeSelect();

		let tmpSelf = this;
		let tmpCommitted = false;
		let tmpCommit = function()
		{
			if (tmpCommitted)
			{
				return;
			}
			tmpCommitted = true;
			let tmpDefaultValue = tmpSelf._getDefaultValueForType(tmpSelect.value);
			tmpSelf.addArrayElement(pPath, tmpDefaultValue);
		};

		tmpSelect.addEventListener('keydown', function(pEvent)
		{
			if (pEvent.key === 'Enter')
			{
				tmpCommit();
			}
			else if (pEvent.key === 'Escape')
			{
				tmpCommitted = true;
				tmpSelf.renderTree();
			}
		});

		tmpSelect.addEventListener('blur', function()
		{
			setTimeout(function()
			{
				tmpCommit();
			}, 100);
		});

		// Insert before the actions container
		let tmpActionsSpan = tmpRowElement.querySelector('.pict-oe-actions');
		if (tmpActionsSpan)
		{
			tmpRowElement.insertBefore(tmpSelect, tmpActionsSpan);
		}
		else
		{
			tmpRowElement.appendChild(tmpSelect);
		}
		tmpSelect.focus();
	}

	/**
	 * Create a type selector <select> element for choosing the type of a new entry.
	 */
	_createTypeSelect()
	{
		let tmpSelect = document.createElement('select');
		tmpSelect.className = 'pict-oe-type-select';

		let tmpTypes = ['String', 'Number', 'Boolean', 'Null', 'Object', 'Array'];
		for (let i = 0; i < tmpTypes.length; i++)
		{
			let tmpOption = document.createElement('option');
			tmpOption.value = tmpTypes[i];
			tmpOption.textContent = tmpTypes[i];
			tmpSelect.appendChild(tmpOption);
		}

		return tmpSelect;
	}

	/**
	 * Return the default value for a given type name.
	 */
	_getDefaultValueForType(pTypeName)
	{
		switch (pTypeName)
		{
			case 'Number':
				return 0;
			case 'Boolean':
				return false;
			case 'Null':
				return null;
			case 'Object':
				return {};
			case 'Array':
				return [];
			case 'String':
			default:
				return '';
		}
	}

	// --- Marshal lifecycle ---

	marshalToView()
	{
		this.renderTree();
		return super.marshalToView();
	}

	// --- Tree rendering ---

	/**
	 * Render the visible tree into the container element.
	 */
	renderTree()
	{
		let tmpData = this._resolveObjectData();
		let tmpTreeElement = this._getTreeElement();
		if (!tmpTreeElement)
		{
			return;
		}

		if (tmpData === null || tmpData === undefined)
		{
			this.pict.ContentAssignment.assignContent(tmpTreeElement, '<div class="pict-oe-empty">No data</div>');
			return;
		}

		let tmpOptions =
		{
			Editable: this.options.Editable,
			ShowTypeIndicators: this.options.ShowTypeIndicators,
			IndentPixels: this.options.IndentPixels,
			ViewHash: this.Hash
		};

		let tmpHTML = '';

		if (typeof tmpData === 'object' && !Array.isArray(tmpData))
		{
			// Render top-level object keys without a root wrapper node
			tmpHTML = this._walkObject(tmpData, '', 0, tmpOptions, true);
			// Add a root-level "add property" button when editable
			if (tmpOptions.Editable)
			{
				tmpHTML += this.pict.parseTemplate(
					this.options.MacroTemplates.Node.RootAddObject,
					{},
					null,
					[this]
				);
			}
		}
		else if (Array.isArray(tmpData))
		{
			// Render top-level array elements without a root wrapper node
			tmpHTML = this._walkArray(tmpData, '', 0, tmpOptions, true);
			// Add a root-level "add element" button when editable
			if (tmpOptions.Editable)
			{
				tmpHTML += this.pict.parseTemplate(
					this.options.MacroTemplates.Node.RootAddArray,
					{},
					null,
					[this]
				);
			}
		}
		else
		{
			// Single primitive value at root
			let tmpNode =
			{
				Path: '',
				Key: '(root)',
				Depth: 0,
				DataType: this._getJsonType(tmpData),
				HasChildren: false,
				ChildCount: 0,
				IsExpanded: false,
				IsArrayElement: false,
				ArrayIndex: -1
			};
			let tmpRenderer = this._NodeRenderers[tmpNode.DataType];
			if (tmpRenderer)
			{
				tmpHTML = tmpRenderer.renderNodeHTML(tmpNode, tmpData, tmpOptions);
			}
		}

		if (!tmpHTML)
		{
			tmpHTML = '<div class="pict-oe-empty">Empty object</div>';
		}

		this.pict.ContentAssignment.assignContent(tmpTreeElement, tmpHTML);
	}

	// --- Internal tree walking ---

	_walkObject(pValue, pBasePath, pDepth, pOptions, pIsRoot)
	{
		let tmpHTML = '';
		let tmpKeys = Object.keys(pValue);

		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpKey = tmpKeys[i];
			let tmpChildPath = pBasePath ? (pBasePath + '.' + tmpKey) : tmpKey;
			let tmpChildValue = pValue[tmpKey];
			let tmpType = this._getJsonType(tmpChildValue);

			let tmpNode =
			{
				Path: tmpChildPath,
				Key: tmpKey,
				Depth: pDepth,
				DataType: tmpType,
				HasChildren: false,
				ChildCount: 0,
				IsExpanded: false,
				IsArrayElement: false,
				ArrayIndex: -1
			};

			if (tmpType === 'object')
			{
				let tmpChildKeys = (tmpChildValue !== null) ? Object.keys(tmpChildValue) : [];
				tmpNode.HasChildren = tmpChildKeys.length > 0;
				tmpNode.ChildCount = tmpChildKeys.length;
				tmpNode.IsExpanded = this._ExpandedPaths.has(tmpChildPath);

				let tmpRenderer = this._NodeRenderers.object;
				tmpHTML += tmpRenderer.renderNodeHTML(tmpNode, tmpChildValue, pOptions);

				if (tmpNode.IsExpanded)
				{
					tmpHTML += this._walkObject(tmpChildValue, tmpChildPath, pDepth + 1, pOptions, false);
				}
			}
			else if (tmpType === 'array')
			{
				tmpNode.HasChildren = tmpChildValue.length > 0;
				tmpNode.ChildCount = tmpChildValue.length;
				tmpNode.IsExpanded = this._ExpandedPaths.has(tmpChildPath);

				let tmpRenderer = this._NodeRenderers.array;
				tmpHTML += tmpRenderer.renderNodeHTML(tmpNode, tmpChildValue, pOptions);

				if (tmpNode.IsExpanded)
				{
					tmpHTML += this._walkArray(tmpChildValue, tmpChildPath, pDepth + 1, pOptions, false);
				}
			}
			else
			{
				let tmpRenderer = this._NodeRenderers[tmpType];
				if (tmpRenderer)
				{
					tmpHTML += tmpRenderer.renderNodeHTML(tmpNode, tmpChildValue, pOptions);
				}
			}
		}

		return tmpHTML;
	}

	_walkArray(pValue, pBasePath, pDepth, pOptions, pIsRoot)
	{
		let tmpHTML = '';

		for (let i = 0; i < pValue.length; i++)
		{
			let tmpChildPath = pBasePath ? (pBasePath + '[' + i + ']') : ('[' + i + ']');
			let tmpChildValue = pValue[i];
			let tmpType = this._getJsonType(tmpChildValue);

			let tmpNode =
			{
				Path: tmpChildPath,
				Key: String(i),
				Depth: pDepth,
				DataType: tmpType,
				HasChildren: false,
				ChildCount: 0,
				IsExpanded: false,
				IsArrayElement: true,
				ArrayIndex: i
			};

			if (tmpType === 'object')
			{
				let tmpChildKeys = (tmpChildValue !== null) ? Object.keys(tmpChildValue) : [];
				tmpNode.HasChildren = tmpChildKeys.length > 0;
				tmpNode.ChildCount = tmpChildKeys.length;
				tmpNode.IsExpanded = this._ExpandedPaths.has(tmpChildPath);

				let tmpRenderer = this._NodeRenderers.object;
				tmpHTML += tmpRenderer.renderNodeHTML(tmpNode, tmpChildValue, pOptions);

				if (tmpNode.IsExpanded)
				{
					tmpHTML += this._walkObject(tmpChildValue, tmpChildPath, pDepth + 1, pOptions, false);
				}
			}
			else if (tmpType === 'array')
			{
				tmpNode.HasChildren = tmpChildValue.length > 0;
				tmpNode.ChildCount = tmpChildValue.length;
				tmpNode.IsExpanded = this._ExpandedPaths.has(tmpChildPath);

				let tmpRenderer = this._NodeRenderers.array;
				tmpHTML += tmpRenderer.renderNodeHTML(tmpNode, tmpChildValue, pOptions);

				if (tmpNode.IsExpanded)
				{
					tmpHTML += this._walkArray(tmpChildValue, tmpChildPath, pDepth + 1, pOptions, false);
				}
			}
			else
			{
				let tmpRenderer = this._NodeRenderers[tmpType];
				if (tmpRenderer)
				{
					tmpHTML += tmpRenderer.renderNodeHTML(tmpNode, tmpChildValue, pOptions);
				}
			}
		}

		return tmpHTML;
	}

	// --- Utility methods ---

	_getJsonType(pValue)
	{
		if (pValue === null || pValue === undefined)
		{
			return 'null';
		}
		if (Array.isArray(pValue))
		{
			return 'array';
		}
		let tmpType = typeof pValue;
		if (tmpType === 'object')
		{
			return 'object';
		}
		if (tmpType === 'number')
		{
			return 'number';
		}
		if (tmpType === 'boolean')
		{
			return 'boolean';
		}
		return 'string';
	}

	_resolveObjectData()
	{
		if (!this.options.ObjectDataAddress)
		{
			return null;
		}

		// Support "AppData.SomeKey" style addresses
		let tmpAddress = this.options.ObjectDataAddress;
		let tmpParts = tmpAddress.split('.');
		let tmpCurrent = this.fable;

		for (let i = 0; i < tmpParts.length; i++)
		{
			if (tmpCurrent === null || tmpCurrent === undefined)
			{
				return null;
			}
			tmpCurrent = tmpCurrent[tmpParts[i]];
		}

		return tmpCurrent;
	}

	_getTreeElement()
	{
		let tmpElementId = 'ObjectEditor-Tree-' + this.Hash;
		let tmpElements = this.pict.ContentAssignment.getElement('#' + tmpElementId);
		if (tmpElements && tmpElements.length > 0)
		{
			return tmpElements[0];
		}
		return null;
	}

	_getValueAtPath(pObject, pPath)
	{
		if (!pPath)
		{
			return pObject;
		}

		let tmpSegments = this._parsePath(pPath);
		let tmpCurrent = pObject;

		for (let i = 0; i < tmpSegments.length; i++)
		{
			if (tmpCurrent === null || tmpCurrent === undefined)
			{
				return undefined;
			}
			tmpCurrent = tmpCurrent[tmpSegments[i]];
		}

		return tmpCurrent;
	}

	_setValueAtPath(pObject, pPath, pValue)
	{
		if (!pPath)
		{
			return;
		}

		let tmpSegments = this._parsePath(pPath);
		let tmpCurrent = pObject;

		for (let i = 0; i < tmpSegments.length - 1; i++)
		{
			if (tmpCurrent === null || tmpCurrent === undefined)
			{
				return;
			}
			tmpCurrent = tmpCurrent[tmpSegments[i]];
		}

		if (tmpCurrent !== null && tmpCurrent !== undefined)
		{
			tmpCurrent[tmpSegments[tmpSegments.length - 1]] = pValue;
		}
	}

	/**
	 * Parse a dotted path with bracket notation into segments.
	 * e.g., "config.items[2].name" -> ["config", "items", 2, "name"]
	 */
	_parsePath(pPath)
	{
		let tmpSegments = [];
		let tmpParts = pPath.split('.');

		for (let i = 0; i < tmpParts.length; i++)
		{
			let tmpPart = tmpParts[i];
			// Check for bracket notation
			let tmpBracketMatch = tmpPart.match(/^([^\[]*)\[(\d+)\]$/);
			if (tmpBracketMatch)
			{
				if (tmpBracketMatch[1])
				{
					tmpSegments.push(tmpBracketMatch[1]);
				}
				tmpSegments.push(parseInt(tmpBracketMatch[2], 10));
			}
			else if (tmpPart)
			{
				tmpSegments.push(tmpPart);
			}
		}

		return tmpSegments;
	}

	/**
	 * Remove all expanded paths that reference a deleted subtree.
	 */
	_cleanupExpandedPaths(pRemovedPath)
	{
		let tmpToRemove = [];
		this._ExpandedPaths.forEach(function(tmpPath)
		{
			if (tmpPath === pRemovedPath || tmpPath.indexOf(pRemovedPath + '.') === 0 || tmpPath.indexOf(pRemovedPath + '[') === 0)
			{
				tmpToRemove.push(tmpPath);
			}
		});

		for (let i = 0; i < tmpToRemove.length; i++)
		{
			this._ExpandedPaths.delete(tmpToRemove[i]);
		}
	}

	/**
	 * After removing an array element, shift expanded paths for higher indices down by one.
	 * e.g., if we removed items[2], then items[3] becomes items[2], items[4] becomes items[3], etc.
	 */
	_shiftArrayExpandedPaths(pArrayPath, pRemovedIndex, pOriginalLength)
	{
		let tmpPrefix = pArrayPath ? pArrayPath : '';

		for (let i = pRemovedIndex + 1; i < pOriginalLength; i++)
		{
			let tmpOldPath = tmpPrefix + '[' + i + ']';
			let tmpNewPath = tmpPrefix + '[' + (i - 1) + ']';

			// Collect all expanded paths that start with the old path
			let tmpToRename = [];
			this._ExpandedPaths.forEach(function(tmpPath)
			{
				if (tmpPath === tmpOldPath)
				{
					tmpToRename.push({ old: tmpPath, replacement: tmpNewPath });
				}
				else if (tmpPath.indexOf(tmpOldPath + '.') === 0)
				{
					tmpToRename.push({ old: tmpPath, replacement: tmpNewPath + tmpPath.substring(tmpOldPath.length) });
				}
				else if (tmpPath.indexOf(tmpOldPath + '[') === 0)
				{
					tmpToRename.push({ old: tmpPath, replacement: tmpNewPath + tmpPath.substring(tmpOldPath.length) });
				}
			});

			for (let j = 0; j < tmpToRename.length; j++)
			{
				this._ExpandedPaths.delete(tmpToRename[j].old);
				this._ExpandedPaths.add(tmpToRename[j].replacement);
			}
		}
	}

	/**
	 * Update expanded paths when an array element moves from one index to another.
	 * Works by collecting all paths for every index in the affected range,
	 * then remapping them to their new positions.
	 */
	_moveArrayExpandedPaths(pArrayPath, pFromIndex, pToIndex, pLength)
	{
		let tmpPrefix = pArrayPath ? pArrayPath : '';

		// Determine the range of indices affected by the move
		let tmpMinIndex = Math.min(pFromIndex, pToIndex);
		let tmpMaxIndex = Math.max(pFromIndex, pToIndex);

		// Collect all expanded paths for every index in the affected range
		// Map: index -> array of { suffix } (the part after the [N])
		let tmpPathsByIndex = {};
		for (let i = tmpMinIndex; i <= tmpMaxIndex; i++)
		{
			tmpPathsByIndex[i] = [];
		}

		let tmpToRemove = [];
		let tmpSelf = this;

		this._ExpandedPaths.forEach(function(tmpPath)
		{
			for (let i = tmpMinIndex; i <= tmpMaxIndex; i++)
			{
				let tmpIndexPath = tmpPrefix + '[' + i + ']';
				if (tmpPath === tmpIndexPath)
				{
					tmpPathsByIndex[i].push('');
					tmpToRemove.push(tmpPath);
				}
				else if (tmpPath.indexOf(tmpIndexPath + '.') === 0)
				{
					tmpPathsByIndex[i].push(tmpPath.substring(tmpIndexPath.length));
					tmpToRemove.push(tmpPath);
				}
				else if (tmpPath.indexOf(tmpIndexPath + '[') === 0)
				{
					tmpPathsByIndex[i].push(tmpPath.substring(tmpIndexPath.length));
					tmpToRemove.push(tmpPath);
				}
			}
		});

		// Remove old paths
		for (let i = 0; i < tmpToRemove.length; i++)
		{
			this._ExpandedPaths.delete(tmpToRemove[i]);
		}

		// Compute new index mapping:
		// When moving from -> to, the element at pFromIndex goes to pToIndex,
		// and all elements between shift by 1 in the opposite direction.
		let tmpNewIndexMap = {};
		if (pFromIndex < pToIndex)
		{
			// Moving forward: elements between (from+1..to) shift down by 1
			tmpNewIndexMap[pFromIndex] = pToIndex;
			for (let i = pFromIndex + 1; i <= pToIndex; i++)
			{
				tmpNewIndexMap[i] = i - 1;
			}
		}
		else
		{
			// Moving backward: elements between (to..from-1) shift up by 1
			tmpNewIndexMap[pFromIndex] = pToIndex;
			for (let i = pToIndex; i < pFromIndex; i++)
			{
				tmpNewIndexMap[i] = i + 1;
			}
		}

		// Re-add paths at their new indices
		let tmpOldIndices = Object.keys(tmpPathsByIndex);
		for (let i = 0; i < tmpOldIndices.length; i++)
		{
			let tmpOldIndex = parseInt(tmpOldIndices[i], 10);
			let tmpNewIndex = tmpNewIndexMap[tmpOldIndex];
			let tmpSuffixes = tmpPathsByIndex[tmpOldIndex];
			for (let j = 0; j < tmpSuffixes.length; j++)
			{
				this._ExpandedPaths.add(tmpPrefix + '[' + tmpNewIndex + ']' + tmpSuffixes[j]);
			}
		}
	}

	/**
	 * Recursively expand paths up to a given depth.
	 */
	_expandToDepth(pValue, pBasePath, pCurrentDepth, pMaxDepth)
	{
		if (pValue === null || pValue === undefined || typeof pValue !== 'object')
		{
			return;
		}

		if (Array.isArray(pValue))
		{
			for (let i = 0; i < pValue.length; i++)
			{
				let tmpChildPath = pBasePath ? (pBasePath + '[' + i + ']') : ('[' + i + ']');
				if (typeof pValue[i] === 'object' && pValue[i] !== null)
				{
					// Mark this child as expanded (it's an object or array that can be toggled)
					this._ExpandedPaths.add(tmpChildPath);
					if (pCurrentDepth + 1 < pMaxDepth)
					{
						this._expandToDepth(pValue[i], tmpChildPath, pCurrentDepth + 1, pMaxDepth);
					}
				}
			}
		}
		else
		{
			let tmpKeys = Object.keys(pValue);
			for (let i = 0; i < tmpKeys.length; i++)
			{
				let tmpKey = tmpKeys[i];
				let tmpChildPath = pBasePath ? (pBasePath + '.' + tmpKey) : tmpKey;
				let tmpChildValue = pValue[tmpKey];
				if (typeof tmpChildValue === 'object' && tmpChildValue !== null)
				{
					// Mark this child as expanded (it's an object or array that can be toggled)
					this._ExpandedPaths.add(tmpChildPath);
					if (pCurrentDepth + 1 < pMaxDepth)
					{
						this._expandToDepth(tmpChildValue, tmpChildPath, pCurrentDepth + 1, pMaxDepth);
					}
				}
			}
		}
	}
}

module.exports = PictViewObjectEditor;

module.exports.default_configuration = _DefaultConfiguration;

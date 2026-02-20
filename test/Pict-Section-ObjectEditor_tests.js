/**
 * Unit tests for Pict Section ObjectEditor
 *
 * @license     MIT
 *
 * @author      Steven Velozo <steven@velozo.com>
 */

var libPict = require('pict');

var Chai = require("chai");
var Expect = Chai.expect;

var libPictSectionObjectEditor = require('../source/Pict-Section-ObjectEditor.js');

suite
(
	'Pict Section ObjectEditor',
	function ()
	{
		suite
		(
			'Module Exports',
			function ()
			{
				test
				(
					'Module should export the main view class',
					function ()
					{
						Expect(libPictSectionObjectEditor).to.be.a('function');
					}
				);
				test
				(
					'Module should export node type classes',
					function ()
					{
						Expect(libPictSectionObjectEditor.PictViewObjectEditorNode).to.be.a('function');
						Expect(libPictSectionObjectEditor.PictViewObjectEditorNodeString).to.be.a('function');
						Expect(libPictSectionObjectEditor.PictViewObjectEditorNodeNumber).to.be.a('function');
						Expect(libPictSectionObjectEditor.PictViewObjectEditorNodeBoolean).to.be.a('function');
						Expect(libPictSectionObjectEditor.PictViewObjectEditorNodeNull).to.be.a('function');
						Expect(libPictSectionObjectEditor.PictViewObjectEditorNodeObject).to.be.a('function');
						Expect(libPictSectionObjectEditor.PictViewObjectEditorNodeArray).to.be.a('function');
					}
				);
				test
				(
					'Module should export default configuration',
					function ()
					{
						Expect(libPictSectionObjectEditor.default_configuration).to.be.an('object');
						Expect(libPictSectionObjectEditor.default_configuration.ViewIdentifier).to.equal('Pict-ObjectEditor');
						Expect(libPictSectionObjectEditor.default_configuration.CSS).to.be.a('string');
						Expect(libPictSectionObjectEditor.default_configuration.Templates).to.be.an('array');
						Expect(libPictSectionObjectEditor.default_configuration.Renderables).to.be.an('array');
					}
				);
			}
		);
		suite
		(
			'View Instantiation',
			function ()
			{
				test
				(
					'Should instantiate an ObjectEditor view',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						Expect(tmpView).to.be.an('object');
						Expect(tmpView.options.ViewIdentifier).to.equal('TestEditor');
						Expect(tmpView.options.ObjectDataAddress).to.equal('AppData.TestData');
						Expect(tmpView.options.InitialExpandDepth).to.equal(1);
						Expect(tmpView.options.Editable).to.equal(true);
					}
				);
				test
				(
					'Should have node renderers after initialization',
					function (fDone)
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						Expect(tmpView._NodeRenderers).to.be.an('object');
						Expect(tmpView._NodeRenderers.string).to.be.an('object');
						Expect(tmpView._NodeRenderers.number).to.be.an('object');
						Expect(tmpView._NodeRenderers.boolean).to.be.an('object');
						Expect(tmpView._NodeRenderers.null).to.be.an('object');
						Expect(tmpView._NodeRenderers.object).to.be.an('object');
						Expect(tmpView._NodeRenderers.array).to.be.an('object');

						return fDone();
					}
				);
			}
		);
		suite
		(
			'Type Detection',
			function ()
			{
				test
				(
					'Should correctly identify JSON types',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						Expect(tmpView._getJsonType('hello')).to.equal('string');
						Expect(tmpView._getJsonType('')).to.equal('string');
						Expect(tmpView._getJsonType(42)).to.equal('number');
						Expect(tmpView._getJsonType(0)).to.equal('number');
						Expect(tmpView._getJsonType(3.14)).to.equal('number');
						Expect(tmpView._getJsonType(true)).to.equal('boolean');
						Expect(tmpView._getJsonType(false)).to.equal('boolean');
						Expect(tmpView._getJsonType(null)).to.equal('null');
						Expect(tmpView._getJsonType(undefined)).to.equal('null');
						Expect(tmpView._getJsonType({})).to.equal('object');
						Expect(tmpView._getJsonType({ a: 1 })).to.equal('object');
						Expect(tmpView._getJsonType([])).to.equal('array');
						Expect(tmpView._getJsonType([1, 2, 3])).to.equal('array');
					}
				);
			}
		);
		suite
		(
			'Path Parsing',
			function ()
			{
				test
				(
					'Should parse simple dot paths',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						let tmpResult = tmpView._parsePath('config.database.host');
						Expect(tmpResult).to.deep.equal(['config', 'database', 'host']);
					}
				);
				test
				(
					'Should parse paths with bracket notation',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						let tmpResult = tmpView._parsePath('items[2].name');
						Expect(tmpResult).to.deep.equal(['items', 2, 'name']);

						let tmpResult2 = tmpView._parsePath('data[0]');
						Expect(tmpResult2).to.deep.equal(['data', 0]);
					}
				);
				test
				(
					'Should parse standalone bracket paths',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						let tmpResult = tmpView._parsePath('[0]');
						Expect(tmpResult).to.deep.equal([0]);
					}
				);
			}
		);
		suite
		(
			'Value Access',
			function ()
			{
				test
				(
					'Should get values at paths',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						let tmpData = { config: { host: 'localhost', ports: [80, 443] } };
						Expect(tmpView._getValueAtPath(tmpData, 'config.host')).to.equal('localhost');
						Expect(tmpView._getValueAtPath(tmpData, 'config.ports[0]')).to.equal(80);
						Expect(tmpView._getValueAtPath(tmpData, 'config.ports[1]')).to.equal(443);
						Expect(tmpView._getValueAtPath(tmpData, 'config')).to.deep.equal({ host: 'localhost', ports: [80, 443] });
					}
				);
				test
				(
					'Should set values at paths',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						let tmpData = { config: { host: 'localhost', ports: [80, 443] } };
						tmpView._setValueAtPath(tmpData, 'config.host', '0.0.0.0');
						Expect(tmpData.config.host).to.equal('0.0.0.0');

						tmpView._setValueAtPath(tmpData, 'config.ports[0]', 8080);
						Expect(tmpData.config.ports[0]).to.equal(8080);
					}
				);
			}
		);
		suite
		(
			'Expand/Collapse State',
			function ()
			{
				test
				(
					'Should manage expanded paths',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						Expect(tmpView._ExpandedPaths.size).to.equal(0);

						tmpView._ExpandedPaths.add('config');
						tmpView._ExpandedPaths.add('config.database');
						Expect(tmpView._ExpandedPaths.size).to.equal(2);
						Expect(tmpView._ExpandedPaths.has('config')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('config.database')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('config.logging')).to.equal(false);
					}
				);
				test
				(
					'Should expand to depth',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData =
						{
							a: { b: { c: 1 }, d: 2 },
							e: [{ f: 3 }]
						};

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView._expandToDepth(tmpPict.AppData.TestData, '', 0, 1);

						// Depth 1 should expand top-level objects/arrays
						Expect(tmpView._ExpandedPaths.has('a')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('e')).to.equal(true);
						// But not deeper
						Expect(tmpView._ExpandedPaths.has('a.b')).to.equal(false);
					}
				);
				test
				(
					'Should expand to deeper depth',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData =
						{
							a: { b: { c: 1 }, d: 2 },
							e: [{ f: 3 }]
						};

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView._expandToDepth(tmpPict.AppData.TestData, '', 0, 2);

						Expect(tmpView._ExpandedPaths.has('a')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('e')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('a.b')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('e[0]')).to.equal(true);
					}
				);
			}
		);
		suite
		(
			'Node HTML Rendering',
			function ()
			{
				test
				(
					'String node renders correctly',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'name',
							Key: 'name',
							Depth: 0,
							DataType: 'string',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.string.renderNodeHTML(tmpNode, 'hello', tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-value-string');
						Expect(tmpHTML).to.contain('hello');
						Expect(tmpHTML).to.contain('pict-oe-key');
						Expect(tmpHTML).to.contain('name');
					}
				);
				test
				(
					'Number node renders correctly',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'port',
							Key: 'port',
							Depth: 0,
							DataType: 'number',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: false, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.number.renderNodeHTML(tmpNode, 8080, tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-value-number');
						Expect(tmpHTML).to.contain('8080');
					}
				);
				test
				(
					'Boolean node renders correctly',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'debug',
							Key: 'debug',
							Depth: 0,
							DataType: 'boolean',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.boolean.renderNodeHTML(tmpNode, true, tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-value-boolean');
						Expect(tmpHTML).to.contain('true');
						Expect(tmpHTML).to.contain('toggleBoolean');
					}
				);
				test
				(
					'Null node renders correctly',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'credentials',
							Key: 'credentials',
							Depth: 0,
							DataType: 'null',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.null.renderNodeHTML(tmpNode, null, tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-value-null');
						Expect(tmpHTML).to.contain('null');
					}
				);
				test
				(
					'Object node renders correctly',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'config',
							Key: 'config',
							Depth: 0,
							DataType: 'object',
							HasChildren: true,
							ChildCount: 3,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.object.renderNodeHTML(tmpNode, { a: 1, b: 2, c: 3 }, tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-toggle');
						Expect(tmpHTML).to.contain('3 keys');
						Expect(tmpHTML).to.contain('pict-oe-type-badge');
						Expect(tmpHTML).to.contain('Object');
					}
				);
				test
				(
					'Array node renders correctly',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'items',
							Key: 'items',
							Depth: 0,
							DataType: 'array',
							HasChildren: true,
							ChildCount: 5,
							IsExpanded: true,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.array.renderNodeHTML(tmpNode, [1, 2, 3, 4, 5], tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-toggle');
						Expect(tmpHTML).to.contain('5 items');
						Expect(tmpHTML).to.contain('Array');
						// Expanded node should show down-arrow
						Expect(tmpHTML).to.contain('\u25BC');
					}
				);
			}
		);
		suite
		(
			'Add/Remove Operations',
			function ()
			{
				test
				(
					'addObjectProperty should add a key to an empty object',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { config: {} };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('config', 'host', 'localhost');
						Expect(tmpPict.AppData.TestData.config.host).to.equal('localhost');
					}
				);
				test
				(
					'addObjectProperty should add a key to a non-empty object',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { config: { host: 'localhost' } };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('config', 'port', 8080);
						Expect(tmpPict.AppData.TestData.config.host).to.equal('localhost');
						Expect(tmpPict.AppData.TestData.config.port).to.equal(8080);
					}
				);
				test
				(
					'addObjectProperty should auto-expand the parent path',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { config: {} };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						Expect(tmpView._ExpandedPaths.has('config')).to.equal(false);
						tmpView.addObjectProperty('config', 'host', 'localhost');
						Expect(tmpView._ExpandedPaths.has('config')).to.equal(true);
					}
				);
				test
				(
					'addObjectProperty should use empty string as default value',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { config: {} };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('config', 'name');
						Expect(tmpPict.AppData.TestData.config.name).to.equal('');
					}
				);
				test
				(
					'addObjectProperty at root with empty path',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { existing: 1 };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('', 'newKey', 'newValue');
						Expect(tmpPict.AppData.TestData.newKey).to.equal('newValue');
						Expect(tmpPict.AppData.TestData.existing).to.equal(1);
					}
				);
				test
				(
					'addObjectProperty should not add to arrays',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [1, 2, 3] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('items', 'bad', 'value');
						// Should not have added a property to the array
						Expect(tmpPict.AppData.TestData.items).to.deep.equal([1, 2, 3]);
					}
				);
				test
				(
					'removeObjectProperty should remove a key',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { config: { host: 'localhost', port: 8080 } };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.removeObjectProperty('config', 'host');
						Expect(tmpPict.AppData.TestData.config).to.deep.equal({ port: 8080 });
						Expect(tmpPict.AppData.TestData.config.host).to.equal(undefined);
					}
				);
				test
				(
					'removeObjectProperty at root with empty path',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { a: 1, b: 2, c: 3 };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.removeObjectProperty('', 'b');
						Expect(tmpPict.AppData.TestData).to.deep.equal({ a: 1, c: 3 });
					}
				);
				test
				(
					'addArrayElement should append to an array',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [1, 2] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addArrayElement('items', 3);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal([1, 2, 3]);
						Expect(tmpPict.AppData.TestData.items.length).to.equal(3);
					}
				);
				test
				(
					'addArrayElement should append to an empty array',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addArrayElement('items', 'first');
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['first']);
					}
				);
				test
				(
					'addArrayElement should auto-expand the parent path',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						Expect(tmpView._ExpandedPaths.has('items')).to.equal(false);
						tmpView.addArrayElement('items', 'x');
						Expect(tmpView._ExpandedPaths.has('items')).to.equal(true);
					}
				);
				test
				(
					'addArrayElement should not add to objects',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { config: { host: 'localhost' } };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addArrayElement('config', 'value');
						// Should not have changed the object
						Expect(tmpPict.AppData.TestData.config).to.deep.equal({ host: 'localhost' });
					}
				);
				test
				(
					'removeArrayElement should remove by index',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c', 'd'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.removeArrayElement('items', 1);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'c', 'd']);
						Expect(tmpPict.AppData.TestData.items.length).to.equal(3);
					}
				);
				test
				(
					'removeArrayElement should reject invalid indices',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.removeArrayElement('items', -1);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'b']);

						tmpView.removeArrayElement('items', 5);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'b']);
					}
				);
				test
				(
					'removeNode should remove an object property via path',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { config: { host: 'localhost', port: 8080 } };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.removeNode('config.host');
						Expect(tmpPict.AppData.TestData.config).to.deep.equal({ port: 8080 });
					}
				);
				test
				(
					'removeNode should remove a top-level key',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { a: 1, b: 2 };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.removeNode('a');
						Expect(tmpPict.AppData.TestData).to.deep.equal({ b: 2 });
					}
				);
				test
				(
					'removeNode should remove an array element via bracket path',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['x', 'y', 'z'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.removeNode('items[1]');
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['x', 'z']);
					}
				);
				test
				(
					'removeNode with empty path should be a no-op',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { a: 1 };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.removeNode('');
						Expect(tmpPict.AppData.TestData).to.deep.equal({ a: 1 });
					}
				);
			}
		);
		suite
		(
			'Path Cleanup on Removal',
			function ()
			{
				test
				(
					'Removing an object property should clean up expanded child paths',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { config: { database: { host: 'localhost', options: { ssl: true } } } };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						// Expand several paths
						tmpView._ExpandedPaths.add('config');
						tmpView._ExpandedPaths.add('config.database');
						tmpView._ExpandedPaths.add('config.database.options');

						tmpView.removeObjectProperty('config', 'database');

						// config.database and its children should be cleaned up
						Expect(tmpView._ExpandedPaths.has('config.database')).to.equal(false);
						Expect(tmpView._ExpandedPaths.has('config.database.options')).to.equal(false);
						// But config itself should still be expanded
						Expect(tmpView._ExpandedPaths.has('config')).to.equal(true);
					}
				);
				test
				(
					'Removing an array element should shift expanded paths for higher indices',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [ { a: 1 }, { b: 2 }, { c: 3 }, { d: 4 } ] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						// Expand items and several elements
						tmpView._ExpandedPaths.add('items');
						tmpView._ExpandedPaths.add('items[0]');
						tmpView._ExpandedPaths.add('items[1]');
						tmpView._ExpandedPaths.add('items[2]');
						tmpView._ExpandedPaths.add('items[3]');

						// Remove element at index 1
						tmpView.removeArrayElement('items', 1);

						// items[1] should be gone (was deleted)
						// items[2] should now be items[1], items[3] should now be items[2]
						Expect(tmpView._ExpandedPaths.has('items')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('items[0]')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('items[1]')).to.equal(true);  // was items[2]
						Expect(tmpView._ExpandedPaths.has('items[2]')).to.equal(true);  // was items[3]
						Expect(tmpView._ExpandedPaths.has('items[3]')).to.equal(false); // shifted away
					}
				);
				test
				(
					'Removing an array element should shift deep expanded child paths',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [ { a: 1 }, { b: { nested: true } }, { c: 3 } ] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						// Expand deep paths under items[2]
						tmpView._ExpandedPaths.add('items');
						tmpView._ExpandedPaths.add('items[1]');
						tmpView._ExpandedPaths.add('items[1].b');
						tmpView._ExpandedPaths.add('items[2]');

						// Remove element at index 0
						tmpView.removeArrayElement('items', 0);

						// items[0] was deleted, items[1] becomes items[0], items[2] becomes items[1]
						Expect(tmpView._ExpandedPaths.has('items[0]')).to.equal(true);    // was items[1]
						Expect(tmpView._ExpandedPaths.has('items[0].b')).to.equal(true);  // was items[1].b
						Expect(tmpView._ExpandedPaths.has('items[1]')).to.equal(true);    // was items[2]
						Expect(tmpView._ExpandedPaths.has('items[2]')).to.equal(false);   // shifted away
					}
				);
			}
		);
		suite
		(
			'Action Button Rendering',
			function ()
			{
				test
				(
					'Editable nodes should have action buttons in HTML',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'name',
							Key: 'name',
							Depth: 0,
							DataType: 'string',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.string.renderNodeHTML(tmpNode, 'hello', tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-actions');
						Expect(tmpHTML).to.contain('pict-oe-action-remove');
						Expect(tmpHTML).to.contain('removeNode');
					}
				);
				test
				(
					'Non-editable nodes should not have action buttons',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'name',
							Key: 'name',
							Depth: 0,
							DataType: 'string',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: false, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.string.renderNodeHTML(tmpNode, 'hello', tmpOptions);
						Expect(tmpHTML).to.not.contain('pict-oe-actions');
						Expect(tmpHTML).to.not.contain('removeNode');
					}
				);
				test
				(
					'Object container should have add and remove buttons',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'config',
							Key: 'config',
							Depth: 0,
							DataType: 'object',
							HasChildren: true,
							ChildCount: 2,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.object.renderNodeHTML(tmpNode, { a: 1, b: 2 }, tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-actions');
						Expect(tmpHTML).to.contain('pict-oe-action-add');
						Expect(tmpHTML).to.contain('pict-oe-action-remove');
						Expect(tmpHTML).to.contain('beginAddToObject');
						Expect(tmpHTML).to.contain('removeNode');
					}
				);
				test
				(
					'Array container should have add and remove buttons',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'items',
							Key: 'items',
							Depth: 0,
							DataType: 'array',
							HasChildren: true,
							ChildCount: 3,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.array.renderNodeHTML(tmpNode, [1, 2, 3], tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-actions');
						Expect(tmpHTML).to.contain('pict-oe-action-add');
						Expect(tmpHTML).to.contain('pict-oe-action-remove');
						Expect(tmpHTML).to.contain('beginAddToArray');
						Expect(tmpHTML).to.contain('removeNode');
					}
				);
				test
				(
					'Non-editable container should not have action buttons',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'config',
							Key: 'config',
							Depth: 0,
							DataType: 'object',
							HasChildren: true,
							ChildCount: 2,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: false, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.object.renderNodeHTML(tmpNode, { a: 1, b: 2 }, tmpOptions);
						Expect(tmpHTML).to.not.contain('pict-oe-actions');
						Expect(tmpHTML).to.not.contain('beginAddToObject');
						Expect(tmpHTML).to.not.contain('removeNode');
					}
				);
			}
		);
		suite
		(
			'Array Reorder Operations',
			function ()
			{
				test
				(
					'moveArrayElementUp should swap an element with its predecessor',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c', 'd'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.moveArrayElementUp('items', 2);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'c', 'b', 'd']);
					}
				);
				test
				(
					'moveArrayElementUp at index 0 should be a no-op',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.moveArrayElementUp('items', 0);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'b', 'c']);
					}
				);
				test
				(
					'moveArrayElementDown should swap an element with its successor',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c', 'd'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.moveArrayElementDown('items', 1);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'c', 'b', 'd']);
					}
				);
				test
				(
					'moveArrayElementDown at last index should be a no-op',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.moveArrayElementDown('items', 2);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'b', 'c']);
					}
				);
				test
				(
					'moveArrayElementToIndex should move an element forward',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c', 'd', 'e'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						// Move index 1 to index 3
						tmpView.moveArrayElementToIndex('items', 1, 3);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'c', 'd', 'b', 'e']);
					}
				);
				test
				(
					'moveArrayElementToIndex should move an element backward',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c', 'd', 'e'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						// Move index 3 to index 1
						tmpView.moveArrayElementToIndex('items', 3, 1);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'd', 'b', 'c', 'e']);
					}
				);
				test
				(
					'moveArrayElementToIndex should clamp out-of-bounds high index to last position',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.moveArrayElementToIndex('items', 0, 999);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['b', 'c', 'a']);
					}
				);
				test
				(
					'moveArrayElementToIndex should clamp negative index to 0',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.moveArrayElementToIndex('items', 2, -5);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['c', 'a', 'b']);
					}
				);
				test
				(
					'moveArrayElementToIndex same from and to should be a no-op',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b', 'c'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.moveArrayElementToIndex('items', 1, 1);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'b', 'c']);
					}
				);
				test
				(
					'moveArrayElementToIndex should reject invalid from index',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: ['a', 'b'] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.moveArrayElementToIndex('items', 5, 0);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'b']);

						tmpView.moveArrayElementToIndex('items', -1, 0);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal(['a', 'b']);
					}
				);
			}
		);
		suite
		(
			'Array Reorder Expanded Path Updates',
			function ()
			{
				test
				(
					'Moving an element up should update expanded paths for both swapped positions',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [ { a: 1 }, { b: 2 }, { c: 3 } ] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView._ExpandedPaths.add('items');
						tmpView._ExpandedPaths.add('items[1]');
						// items[0] and items[2] are NOT expanded

						// Move index 1 up to index 0
						tmpView.moveArrayElementUp('items', 1);

						// The expanded element moved from [1] to [0]
						Expect(tmpView._ExpandedPaths.has('items[0]')).to.equal(true);
						// The element that was at [0] shifted to [1] and was not expanded
						Expect(tmpView._ExpandedPaths.has('items[1]')).to.equal(false);
						Expect(tmpView._ExpandedPaths.has('items[2]')).to.equal(false);
					}
				);
				test
				(
					'Moving an element forward should update expanded paths for all affected indices',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [ { a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 } ] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView._ExpandedPaths.add('items');
						tmpView._ExpandedPaths.add('items[1]');
						tmpView._ExpandedPaths.add('items[3]');

						// Move index 1 to index 3
						tmpView.moveArrayElementToIndex('items', 1, 3);
						// After move: [a, c, d, b, e]
						// items[1] (b) moved to items[3], items[2](c) went to [1], items[3](d) went to [2]

						Expect(tmpView._ExpandedPaths.has('items[3]')).to.equal(true);  // was items[1] (b, was expanded)
						Expect(tmpView._ExpandedPaths.has('items[2]')).to.equal(true);  // was items[3] (d, was expanded)
						Expect(tmpView._ExpandedPaths.has('items[1]')).to.equal(false); // was items[2] (c, was NOT expanded)
					}
				);
				test
				(
					'Moving an element should preserve deep child expanded paths',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [ { a: { nested: true } }, { b: 2 }, { c: 3 } ] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView._ExpandedPaths.add('items');
						tmpView._ExpandedPaths.add('items[0]');
						tmpView._ExpandedPaths.add('items[0].a');

						// Move index 0 to index 2
						tmpView.moveArrayElementToIndex('items', 0, 2);

						// Deep child paths should have moved with their parent
						Expect(tmpView._ExpandedPaths.has('items[2]')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('items[2].a')).to.equal(true);
						Expect(tmpView._ExpandedPaths.has('items[0]')).to.equal(false);
						Expect(tmpView._ExpandedPaths.has('items[0].a')).to.equal(false);
					}
				);
			}
		);
		suite
		(
			'Array Element Move Button Rendering',
			function ()
			{
				test
				(
					'Array element nodes should have move up/down buttons when editable',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'items[1]',
							Key: '1',
							Depth: 1,
							DataType: 'string',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: true,
							ArrayIndex: 1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.string.renderNodeHTML(tmpNode, 'hello', tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-action-move');
						Expect(tmpHTML).to.contain('moveArrayElementUp');
						Expect(tmpHTML).to.contain('moveArrayElementDown');
					}
				);
				test
				(
					'Non-array-element nodes should not have move buttons',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'name',
							Key: 'name',
							Depth: 0,
							DataType: 'string',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.string.renderNodeHTML(tmpNode, 'hello', tmpOptions);
						Expect(tmpHTML).to.not.contain('pict-oe-action-move');
						Expect(tmpHTML).to.not.contain('moveArrayElementUp');
						Expect(tmpHTML).to.not.contain('moveArrayElementDown');
					}
				);
				test
				(
					'Array element container nodes should have move buttons',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'items[0]',
							Key: '0',
							Depth: 1,
							DataType: 'object',
							HasChildren: true,
							ChildCount: 2,
							IsExpanded: false,
							IsArrayElement: true,
							ArrayIndex: 0
						};

						let tmpOptions = { Editable: true, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.object.renderNodeHTML(tmpNode, { a: 1, b: 2 }, tmpOptions);
						Expect(tmpHTML).to.contain('pict-oe-action-move');
						Expect(tmpHTML).to.contain('moveArrayElementUp');
						Expect(tmpHTML).to.contain('moveArrayElementDown');
						Expect(tmpHTML).to.contain('pict-oe-action-add');
					}
				);
			}
		);
		suite
		(
			'Root Add Button',
			function ()
			{
				test
				(
					'Default configuration should have root add MacroTemplates',
					function ()
					{
						Expect(libPictSectionObjectEditor.default_configuration.MacroTemplates.Node.RootAddObject).to.be.a('string');
						Expect(libPictSectionObjectEditor.default_configuration.MacroTemplates.Node.RootAddArray).to.be.a('string');
						Expect(libPictSectionObjectEditor.default_configuration.MacroTemplates.Node.RootAddObject).to.contain('beginAddToObject');
						Expect(libPictSectionObjectEditor.default_configuration.MacroTemplates.Node.RootAddArray).to.contain('beginAddToArray');
					}
				);
				test
				(
					'Empty root object should still allow adding properties via API',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = {};

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						// The data starts empty
						Expect(Object.keys(tmpPict.AppData.TestData).length).to.equal(0);

						// Add a property to the root object
						tmpView.addObjectProperty('', 'newKey', 'newValue');
						Expect(tmpPict.AppData.TestData.newKey).to.equal('newValue');
						Expect(Object.keys(tmpPict.AppData.TestData).length).to.equal(1);
					}
				);
				test
				(
					'Empty root array should still allow adding elements via API',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = [];

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						// The data starts empty
						Expect(tmpPict.AppData.TestData.length).to.equal(0);

						// Add an element to the root array (using empty path for root)
						tmpView.addArrayElement('', 'first');
						Expect(tmpPict.AppData.TestData).to.deep.equal(['first']);
					}
				);
				test
				(
					'Root add button CSS class should be in default configuration',
					function ()
					{
						Expect(libPictSectionObjectEditor.default_configuration.CSS).to.contain('pict-oe-root-add');
					}
				);
			}
		);
		suite
		(
			'Type-Aware Add Operations',
			function ()
			{
				test
				(
					'_getDefaultValueForType should return correct defaults for all types',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						Expect(tmpView._getDefaultValueForType('String')).to.equal('');
						Expect(tmpView._getDefaultValueForType('Number')).to.equal(0);
						Expect(tmpView._getDefaultValueForType('Boolean')).to.equal(false);
						Expect(tmpView._getDefaultValueForType('Null')).to.equal(null);
						Expect(tmpView._getDefaultValueForType('Object')).to.deep.equal({});
						Expect(tmpView._getDefaultValueForType('Array')).to.deep.equal([]);
					}
				);
				test
				(
					'addObjectProperty should accept object default values',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = {};

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('', 'config', {});
						Expect(tmpPict.AppData.TestData.config).to.deep.equal({});
						Expect(typeof tmpPict.AppData.TestData.config).to.equal('object');
					}
				);
				test
				(
					'addObjectProperty should accept array default values',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = {};

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('', 'items', []);
						Expect(tmpPict.AppData.TestData.items).to.deep.equal([]);
						Expect(Array.isArray(tmpPict.AppData.TestData.items)).to.equal(true);
					}
				);
				test
				(
					'addObjectProperty should accept number default values',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = {};

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('', 'count', 0);
						Expect(tmpPict.AppData.TestData.count).to.equal(0);
						Expect(typeof tmpPict.AppData.TestData.count).to.equal('number');
					}
				);
				test
				(
					'addObjectProperty should accept boolean default values',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = {};

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('', 'active', false);
						Expect(tmpPict.AppData.TestData.active).to.equal(false);
						Expect(typeof tmpPict.AppData.TestData.active).to.equal('boolean');
					}
				);
				test
				(
					'addObjectProperty should accept null default values',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = {};

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addObjectProperty('', 'data', null);
						Expect(tmpPict.AppData.TestData.data).to.equal(null);
					}
				);
				test
				(
					'addArrayElement should accept all type defaults',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						tmpPict.AppData = {};
						tmpPict.AppData.TestData = { items: [] };

						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.addArrayElement('items', 0);
						tmpView.addArrayElement('items', false);
						tmpView.addArrayElement('items', null);
						tmpView.addArrayElement('items', {});
						tmpView.addArrayElement('items', []);

						Expect(tmpPict.AppData.TestData.items.length).to.equal(5);
						Expect(tmpPict.AppData.TestData.items[0]).to.equal(0);
						Expect(tmpPict.AppData.TestData.items[1]).to.equal(false);
						Expect(tmpPict.AppData.TestData.items[2]).to.equal(null);
						Expect(tmpPict.AppData.TestData.items[3]).to.deep.equal({});
						Expect(tmpPict.AppData.TestData.items[4]).to.deep.equal([]);
					}
				);
				test
				(
					'Type select CSS class should be in default configuration',
					function ()
					{
						Expect(libPictSectionObjectEditor.default_configuration.CSS).to.contain('pict-oe-type-select');
					}
				);
			}
		);
		suite
		(
			'HTML Escaping',
			function ()
			{
				test
				(
					'Should escape special characters',
					function ()
					{
						let tmpPict = new libPict({ Product: 'TestObjectEditor' });
						let tmpView = tmpPict.addView('TestEditor',
						{
							ViewIdentifier: 'TestEditor',
							ObjectDataAddress: 'AppData.TestData'
						}, libPictSectionObjectEditor);

						tmpView.initialize();

						let tmpNode =
						{
							Path: 'html',
							Key: 'html',
							Depth: 0,
							DataType: 'string',
							HasChildren: false,
							ChildCount: 0,
							IsExpanded: false,
							IsArrayElement: false,
							ArrayIndex: -1
						};

						let tmpOptions = { Editable: false, ShowTypeIndicators: true, IndentPixels: 20, ViewHash: 'TestEditor' };

						let tmpHTML = tmpView._NodeRenderers.string.renderNodeHTML(tmpNode, '<script>alert("xss")</script>', tmpOptions);
						Expect(tmpHTML).to.not.contain('<script>');
						Expect(tmpHTML).to.contain('&lt;script&gt;');
					}
				);
			}
		);
	}
);

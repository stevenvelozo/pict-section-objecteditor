// Pict Section: Object Editor
// A tree-based JSON object viewer and editor for Pict applications.

// The main object editor view class
module.exports = require('./views/PictView-ObjectEditor.js');

// Node type views
module.exports.PictViewObjectEditorNode = require('./views/PictView-ObjectEditor-Node.js');
module.exports.PictViewObjectEditorNodeString = require('./views/PictView-ObjectEditor-NodeString.js');
module.exports.PictViewObjectEditorNodeNumber = require('./views/PictView-ObjectEditor-NodeNumber.js');
module.exports.PictViewObjectEditorNodeBoolean = require('./views/PictView-ObjectEditor-NodeBoolean.js');
module.exports.PictViewObjectEditorNodeNull = require('./views/PictView-ObjectEditor-NodeNull.js');
module.exports.PictViewObjectEditorNodeObject = require('./views/PictView-ObjectEditor-NodeObject.js');
module.exports.PictViewObjectEditorNodeArray = require('./views/PictView-ObjectEditor-NodeArray.js');

// Default configuration
module.exports.default_configuration = require('./Pict-Section-ObjectEditor-DefaultConfiguration.js');

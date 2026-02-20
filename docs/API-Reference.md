# API Reference

The `PictViewObjectEditor` class extends `pict-view` and provides a public API for controlling the tree display and manipulating the underlying JSON data.

## Expand / Collapse

### toggleNode(pPath)

Toggle the expand/collapse state of a container node.

```javascript
editor.toggleNode('server.database');
editor.toggleNode('features[0]');
```

### expandAll()

Expand every container node in the tree.

```javascript
editor.expandAll();
```

### collapseAll()

Collapse all nodes, showing only top-level keys.

```javascript
editor.collapseAll();
```

### expandToDepth(pDepth)

Expand all container nodes up to a given depth. Depth 0 shows only top-level keys; depth 1 expands the first level of children; and so on.

```javascript
editor.expandToDepth(2);
```

## Value Editing

### setValueAtPath(pPath, pValue)

Set a value at a dot/bracket path and re-render the tree.

```javascript
editor.setValueAtPath('server.port', 3000);
editor.setValueAtPath('features[0]', 'authentication');
editor.setValueAtPath('database.ssl', true);
```

### toggleBoolean(pPath)

Toggle a boolean value between `true` and `false`.

```javascript
editor.toggleBoolean('server.debug');
```

### beginEdit(pPath, pType)

Start inline editing on a leaf node. Replaces the value display with a text input. The `pType` parameter should be `'string'` or `'number'`, which determines the input type.

This method is typically called by the double-click handler in the rendered HTML and does not normally need to be called directly.

```javascript
editor.beginEdit('server.host', 'string');
editor.beginEdit('server.port', 'number');
```

**Keyboard controls during inline edit:**
- **Enter** -- Commit the new value
- **Escape** -- Cancel and revert to the previous value

## Object Mutation

### addObjectProperty(pPath, pKey, pDefaultValue)

Add a new property to the object at `pPath`. If `pPath` is an empty string, adds to the root object. The parent node is auto-expanded.

```javascript
// Add to root object
editor.addObjectProperty('', 'newKey', 'hello');

// Add a nested property
editor.addObjectProperty('server', 'timeout', 30000);

// Add a sub-object
editor.addObjectProperty('server', 'tls', { enabled: false, cert: '' });

// Add an array
editor.addObjectProperty('server', 'listeners', []);
```

### removeObjectProperty(pPath, pKey)

Remove a property from the object at `pPath`.

```javascript
editor.removeObjectProperty('server', 'debug');
editor.removeObjectProperty('', 'obsoleteKey');
```

## Array Mutation

### addArrayElement(pPath, pDefaultValue)

Append an element to the array at `pPath`. If `pPath` is an empty string, appends to the root array. The parent node is auto-expanded.

```javascript
editor.addArrayElement('features', 'newFeature');
editor.addArrayElement('features', { name: 'auth', enabled: true });
editor.addArrayElement('features', [1, 2, 3]);
```

### removeArrayElement(pPath, pIndex)

Remove an element from the array at `pPath` by numeric index. Expanded paths for higher indices are automatically shifted down.

```javascript
editor.removeArrayElement('features', 2);
```

## Node Removal

### removeNode(pPath)

Remove a node from its parent by parsing the path to determine whether it is an object property or an array element. This is the method called by the remove button in the UI.

```javascript
// Removes an object property
editor.removeNode('server.debug');

// Removes a top-level key
editor.removeNode('obsoleteKey');

// Removes an array element
editor.removeNode('features[2]');
```

## Array Reordering

### moveArrayElementUp(pPath, pIndex)

Swap an array element with the element before it (index - 1). No-op if already at index 0.

```javascript
editor.moveArrayElementUp('features', 2);
```

### moveArrayElementDown(pPath, pIndex)

Swap an array element with the element after it (index + 1). No-op if already at the last index.

```javascript
editor.moveArrayElementDown('features', 0);
```

### moveArrayElementToIndex(pPath, pFromIndex, pToIndex)

Move an array element from one index to another. Elements between the two indices shift to make room. Out-of-bounds `pToIndex` values are clamped to the valid range.

```javascript
// Move element 0 to position 3
editor.moveArrayElementToIndex('features', 0, 3);
```

## Interactive Add (UI)

### beginAddToObject(pPath)

Show an inline key name input and type selector dropdown on the object node at `pPath`. The user types a key name, selects a type (String, Number, Boolean, Null, Object, Array), and presses Enter to commit. Pressing Escape cancels.

This is the method called by the `+` button on object container nodes.

### beginAddToArray(pPath)

Show a type selector dropdown on the array node at `pPath`. The user selects a type and presses Enter to append a new element of that type. Pressing Escape cancels.

This is the method called by the `+` button on array container nodes.

## Tree Rendering

### renderTree()

Re-render the visible tree from the current data and expanded state. Called automatically after any data mutation. You can call this manually after modifying `AppData` externally.

```javascript
// After modifying AppData directly:
_Pict.AppData.Config.server.port = 9090;
editor.renderTree();
```

## Pict View Lifecycle

The Object Editor participates in the standard Pict view lifecycle:

### render() / renderAsync(fCallback)

Render the container template, inject CSS, expand to `InitialExpandDepth` on first render, and populate the tree.

### marshalToView()

Re-renders the tree. Called by the Pict marshaling system.

### onAfterRender()

After each render, ensures CSS is injected and the tree is populated.

### onAfterInitialRender()

Called once on the first render. Expands the tree to `InitialExpandDepth`.

## Path Syntax

Paths use dot notation for object properties and bracket notation for array indices:

| Path | Meaning |
|------|---------|
| `'server'` | Top-level property `server` |
| `'server.port'` | Nested property `port` inside `server` |
| `'features[0]'` | First element of the `features` array |
| `'features[2].name'` | Property `name` on the third element of `features` |
| `'data[0][1]'` | Element `[1]` of element `[0]` of `data` |
| `''` | Root object/array (used with add/remove for root-level operations) |

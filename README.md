# storeit-value
Provides a simple interface to read/write and observe changes to a `storeit` value.

Where `storeit` exposes an api to manage all values stored,
`storeit-value` provides access to a single value.

Less talk more rock...

```javascript
// Create a `storeit` store with the super sweet `storeit-webstorage` package.

var Storeit = require("storeit-webstorage").StoreitLocal; // use an HTML5 local storage provider.
var StoreitValue = require("storeit-value");

var todoStore = new Storeit("todos");

var laundryTodo = new StoreitValue(todoStore, {
    id: 1
    title: "Laundry",
    isDone: false
});

// The key used by the store is exposed as a getter.
var key = laundryTodo.key; // `storeit` defaults this to `id` property.

// Get a property.
var isDone = laundryTodo.get("isDone");

// Check for a property
var hasTitle = laundDryTodo.has("title");

// Set a property.
laundryTodo.set("title", "DO LAUNDRY!!"); // Auto saved into storage.

// Set a few properties.
laundryTodo.set({ title: "Do the Laundry.", isDone: true }); // Both are saved!

// Listen for changes.
function listener(changes) {
    console.log(changes); // From the above set would output `{title: "Do the Laundry.", isDone: true }`
}

laundryTodo.on("changed", listener);
laundryTodo.off("changed", listener);
```

In addition, you can extend StoreitValue with custom types!

```javascript
// Returns a function constructor, cool!
var TodoValue = StoreitValue.extend({
    store: todoStore,
    fields: ["title", "isDone"]
});

var laundryTodo = new TodoValue({ id: 1, title: "Laundry", isDone: false });

// `laundryTodo` is an instanceof StoreitValue, so it exposes the same api:
// `get/set`, `on/off`

// In addition... getters and setters!

laundryTodo.isDone = true;
console.log(laundryTodo.title);
```

### Githooks

For developers contributing to this repo's source code, please run the following npm script:

```
npm run githooks
```

This script provides:

- pre commit: Runs jshint before commit is added to history.
- pre push: Runs tests before code is pushed up to remote.

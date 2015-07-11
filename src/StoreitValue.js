import { makeEmitter } from "pubit-as-promised";

export default class StoreitValue {
    constructor(store, properties) {
        this._publish = makeEmitter(this, ["changed"]); // on/off/once mixed in.
        this._store = store;
        var primaryKey = store.options.primaryKey;

        if (!(primaryKey in properties)) {
            throw new Error("StoreitValue creation failed! Missing primary key in properties.");
        }

        this._key = properties[primaryKey];
        this._store.set(properties);

        this._store.on("modified", this._publishChangedIfValueModified.bind(this));
    }

    get key() {
        return this._key;
    }

    has(prop) {
        var value = this._getFromStore();
        return prop in value;
    }

    get(prop) {
        var value = this._getFromStore()
        return value[prop];
    }

    set(...args) {
        var update;
        if (args.length === 1) {
            update = args[0];
        } else {
            var [prop, value] = args;
            update = { [prop]: value };
        }
        this._store.set(this._key, update);
    }

    _getFromStore() {
        return this._store.get(this._key);
    }

    _publishChangedIfValueModified(value, key) {
        if (key === this._key) {
            this._publish("changed", value);
        }
    }
}

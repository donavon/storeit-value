import { makeEmitter } from "pubit-as-promised";

export default class StoreitValue {
    constructor(store, properties) {
        this._publish = makeEmitter(this, ["changed"]); // on/off/once mixed in.
        this._store = store;

        if (!("id" in properties)) {
            throw new Error("StoreitValue creation failed! Missing id in properties.");
        }

        this._id = properties.id;
        this._store.set(properties);
    }

    get id() {
        return this._id;
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
        this._store.set(this._id, update);
    }

    _getFromStore() {
        return this._store.get(this.id);
    }
}

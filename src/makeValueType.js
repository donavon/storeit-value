export default function makeValueType(ParentValueType, { store, fields }) {
    function CustomStoreitValue(properties) {
        ParentValueType.call(this, store, properties);
    }

    CustomStoreitValue.prototype = Object.create(ParentValueType.prototype);

    // Expose primary key field as a getter (default is `id`)
    var { primaryKey } = store.options;
    Object.defineProperty(CustomStoreitValue.prototype, primaryKey, {
        get() {
            return this.key;
        },
        enumerable: true
    });

    fields.forEach((field) => {
        Object.defineProperty(CustomStoreitValue.prototype, field, {
            get() {
                var val;
                if (this._store.has(this.key)) {
                    var data = this._store.get(this.key);
                    val = data[field];
                }
                return val;
            },
            set(val) {
                this._store.set(this.key, { [field]: val });
            },
            enumerable: true
        });
    });

    return CustomStoreitValue;
}

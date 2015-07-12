import _ from "underscore";
import { makeEmitter } from "pubit-as-promised";

export default function StubStore() {
    var data = Object.create(null);
    var publish = makeEmitter(this, ["modified"]);

    data["100"] = { color: "gray", message: "prepopulated" };

    return _.extend(this, {
        options: {
            primaryKey: "id"
        },
        has: sinon.spy((id) => {
            return id in data;
        }),
        get: sinon.spy((id) => {
            if (!this.has(id)) {
                throw new Error("Key does not exist.");
            }
            return data[id];
        }),
        set: sinon.spy((...args) => {
            var [id, val] = args;

            if (args.length === 1) {
                val = id;
                id = val.id;
            }

            if (this.has(id)) {
                _.extend(this.get(id), val);
            } else {
                data[id] = val;
            }

            publish("modified", val, id);
        })
    });
}

/*jshint expr: true */
import _ from "underscore";
import StoreitValue from "../src/StoreitValue";

function StubStore() {
    var data = Object.create(null);

    return _.extend(this, {
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
        })
    });
}

describe("StoreitValue", function () {
    beforeEach(() => {
        this.store = new StubStore();
    });

    describe("when creating an instance", () => {
        beforeEach(() => {
            this.properties = {
                id: 1,
                color: "red",
                message: "sos"
            };
            this.value = new StoreitValue(this.store, this.properties);
        });

        it("should implement the Storeit interface", () => {
            this.value.should.respondTo("has");
            this.value.should.respondTo("get");
            this.value.should.respondTo("set");
        });

        it("should implement the Pubit (observable) interface", () => {
            this.value.should.respondTo("on");
            this.value.should.respondTo("off");
            this.value.should.respondTo("once");
        });

        it("should have an id property", () => {
            this.value.id.should.equal(1);
        });

        it("should set the store with properties", () => {
            this.store.set.should.have.been.calledWith(this.properties);
        });

        describe("when getting a property", () => {
            beforeEach(() => {
                this.color = this.value.get("color");
            });

            it("should ask the store for the value", () => {
                this.store.get.should.have.been.calledWith(1);
            });

            it("should return the right color", () => {
                this.color.should.equal("red");
            });
        });

        describe("when asking if a value has a property", () => {
            describe("that exists", () => {
                beforeEach(() => {
                    this.hasColor = this.value.has("color");
                });

                it("should ask the store for the value", () => {
                    this.store.get.should.have.been.calledWith(1);
                });

                it("should return true", () => {
                    this.hasColor.should.be.true;
                });
            });

            describe("that does not exist", () => {
                beforeEach(() => {
                    this.hasFoo = this.value.has("foo");
                });

                it("should ask the store for the value", () => {
                    this.store.get.should.have.been.calledWith(1);
                });

                it("should return false", () => {
                    this.hasFoo.should.be.false;
                });
            });
        });

        describe("when setting a property", () => {
            beforeEach(() => {
                this.value.set("color", "blue");
            });

            it("should set the store with an object", () => {
                this.store.set.getCall(1).should.have.been.calledWith(1, sinon.match({ color: "blue" }));
            });

            it("should return the new color", () => {
                this.value.get("color").should.equal("blue");
            });
        });

        describe("when setting multiple properties", () => {
            beforeEach(() => {
                this.value.set({ color: "green", message: "success!" });
            });

            it("should set the store with an object", () => {
                this.store.set.getCall(1).should.have.been.calledWith(1, sinon.match({ color: "green", message: "success!" }));
            });

            it("should return the new color", () => {
                this.value.get("color").should.equal("green");
            });

            it("should return the new message", () => {
                this.value.get("message").should.equal("success!");
            });
        });
    });

    describe("when attempting to create an instance w/o an id", () => {
        beforeEach(() => {
            this.createValue = () => {
                new StoreitValue(this.store, {
                    color: "brown",
                    message: "who cares this object won't be valid :("
                });
            };
        });

        it("should throw w/ require id error", () => {
            this.createValue.should.throw(Error, "StoreitValue creation failed! Missing id in properties.");
        });
    });
});

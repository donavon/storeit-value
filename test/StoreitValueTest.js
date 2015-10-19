/*jshint expr: true */
import StoreitValue from "../src/StoreitValue";
import StubStore from "./support/StubStore";

describe("StoreitValue", function () {
    beforeEach(() => {
        this.store = new StubStore();
    });

    var testStoreitValueAs = (type, valueAndProperties) => {
        describe(`when creating an instance from ${type}: `, () => {
            beforeEach(() => {
                var { value, properties } = valueAndProperties(this.store);
                this.value = value;
                this.properties = properties;
            });

            it("should implement the Storeit interface", () => {
                this.value.should.respondTo("has");
                this.value.should.respondTo("get");
                this.value.should.respondTo("set");
                this.value.should.respondTo("toObject");
                this.value.should.have.property("isStored");
            });

            it("should implement the Pubit (observable) interface", () => {
                this.value.should.respondTo("on");
                this.value.should.respondTo("off");
                this.value.should.respondTo("once");
            });

            it("should have expose the store key", () => {
                this.value.key.should.equal(this.properties.id);
            });

            it("should have the key and id be equal", () => {
                this.value.key.should.equal(this.value.get("id"));
            });

            it("should set the store with properties", () => {
                this.store.set.should.have.been.calledWith(this.properties);
            });

            it("should report being stored", () => {
                this.value.isStored.should.be.true;
            });

            it("should convert to a plain vanilla object", () => {
                this.value.toObject().should.eql(this.properties);
            });

            it("should listen to the store for modified events", () => {
                this.store.on.should.have.been.calledWith("modified");
            });

            it("should listen to the store for removed events", () => {
                this.store.on.should.have.been.calledWith("removed");
            });

            describe("when getting a property", () => {
                describe("that exists", () => {
                    beforeEach(() => {
                        this.color = this.value.get("color");
                    });

                    it("should ask the store for the value", () => {
                        this.store.get.should.have.been.calledWith(this.properties.id);
                    });

                    it("should return the right color", () => {
                        this.color.should.equal(this.properties.color);
                    });
                });

                describe("that does not exist", () => {
                    beforeEach(() => {
                        this.nothing = this.value.get("nothing");
                    });

                    it("should return undefined", () => {
                        global.expect(this.nothing).to.be.undefined;
                    });
                });
            });

            describe("when asking if a value has a property", () => {
                describe("that exists", () => {
                    beforeEach(() => {
                        this.hasColor = this.value.has("color");
                    });

                    it("should ask the store for the value", () => {
                        this.store.get.should.have.been.calledWith(this.properties.id);
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
                        this.store.get.should.have.been.calledWith(this.properties.id);
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
                    this.store.set.getCall(1).should.have.been.calledWith(
                        this.properties.id,
                        sinon.match({ color: "blue" })
                    );
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
                    this.store.set.getCall(1).should.have.been.calledWith(
                        this.properties.id,
                        sinon.match({ color: "green", message: "success!" })
                    );
                });

                it("should return the new color", () => {
                    this.value.get("color").should.equal("green");
                });

                it("should return the new message", () => {
                    this.value.get("message").should.equal("success!");
                });
            });

            describe("when a listener is attached", () => {
                beforeEach(() => {
                    this.changedListener = sinon.stub();
                    this.value.on("changed", this.changedListener);
                });

                describe("and a single property is set", () => {
                    beforeEach(() => {
                        this.value.set("color", "orange");
                    });

                    it("should call the listener", () => {
                        this.changedListener.should.have.been.calledWith(sinon.match({ color: "orange" }));
                    });
                });

                describe("and multiple properties are set", () => {
                    beforeEach(() => {
                        this.value.set({ color: "black", message: "black is the new orange" });
                    });

                    it("should call the listener", () => {
                        this.changedListener.should.have.been.calledWith(sinon.match({
                            color: "black",
                            message: "black is the new orange"
                        }));
                    });
                });

                describe("and another value in the store is modified", () => {
                    beforeEach(() => {
                        this.store.set({ id: "100", message: "another value" });
                    });

                    it("should NOT call the listener", () => {
                        this.changedListener.should.not.have.been.called;
                    });
                });
            });
        });
    };
    testStoreitValueAs("StoreitValue", (store) => {
        var properties = {
            id: "1",
            color: "red",
            message: "sos"
        };

        return {
            properties,
            value: new StoreitValue(store, properties)
        };
    });

    testStoreitValueAs("a custom value type", (store) => {
        var CustomValue = StoreitValue.extend({
            store,
            fields: ["color", "message"]
        });
        var properties = {
            id: "2",
            color: "yellow",
            message: "warning"
        };

        return {
            properties,
            value: new CustomValue(properties)
        };
    });

    describe("when attempting to create an instance w/o a primary key (id)", () => {
        beforeEach(() => {
            this.createValue = () => {
                new StoreitValue(this.store, {
                    color: "brown",
                    message: "who cares this object won't be valid :("
                });
            };
        });

        it("should throw w/ require id error", () => {
            this.createValue.should.throw(Error, "StoreitValue creation failed! Missing primary key in properties.");
        });
    });

    describe("when creating an instance with just the primary key", () => {
        beforeEach(() => {
            this.value = new StoreitValue(this.store, { id: "ABC" });
        });

        it("should expose the key", () => {
            this.value.key.should.equal("ABC");
        });

        it("should not set the store", () => {
            this.store.set.should.not.have.been.called;
        });

        it("should not be stored", () => {
            this.value.isStored.should.be.false;
        });

        it("should convert to an object w/ just isStored", () => {
            this.value.toObject().should.eql({ id: "ABC" });
        });

        it("should listen to the store for modified events", () => {
            this.store.on.should.have.been.calledWith("modified");
        });

        it("should listen to the store for modified events", () => {
            this.store.on.should.have.been.calledWith("removed");
        });
    });

    describe("when data is removed from the store", () => {
        describe("and it is the value's key", () => {
            beforeEach(() => {
                new StoreitValue(this.store, {
                    id: "3",
                    color: "brown",
                    message: "who cares this object won't be valid :("
                });
                this.store.remove("3");
            });

            it("should stop listening to the store for modified events", () => {
                this.store.off.should.have.been.calledWith("modified");
            });

            it("should stop listening to the store for removed events", () => {
                this.store.off.should.have.been.calledWith("removed");
            });
        });

        describe("and it is not the value's key", () => {
            beforeEach(() => {
                this.store.remove("100");
            });

            it("should remain listening to the store for modified events", () => {
                this.store.off.should.not.have.been.calledWith("modified");
            });

            it("should remain listening to the store for removed events", () => {
                this.store.off.should.not.have.been.calledWith("removed");
            });
        });
    });
});

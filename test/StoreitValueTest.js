/*jshint expr: true */
import StoreitValue from "../src/StoreitValue";
import StubStore from "./support/StubStore";

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

        it("should have expose the store key", () => {
            this.value.key.should.equal(1);
        });

        it("should have the key and id be equal", () => {
            this.value.key.should.equal(this.value.get("id"));
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
                    this.store.set({ id: "2", message: "another value" });
                });

                it("should NOT call the listener", () => {
                    this.changedListener.should.not.have.been.called;
                });
            });
        });
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
});

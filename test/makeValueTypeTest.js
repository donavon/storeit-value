/*jshint expr: true */
import makeValueType from "../src/makeValueType";
import StoreitValue from "../src/StoreitValue";
import StubStore from "./support/StubStore";

describe("makeValueType", function () {
    beforeEach(() => {
        this.ParentValue = StoreitValue;
        this.CustomValue = makeValueType(StoreitValue, {
            store: new StubStore(),
            fields: ["title", "isDone"]
        });
    });

    it("should return a function", () => {
        (typeof this.CustomValue).should.equal("function");
    });

    it("should have a prototype that is an instanceof the ParentValue", () => {
        this.CustomValue.prototype.should.be.an.instanceof(this.ParentValue);
    });

    describe("when creating an instance of the type", () => {
        beforeEach(() => {
            this.value = new this.CustomValue({
                id: "A",
                title: "Clean room",
                isDone: false
            });
        });

        describe("when getting properties", () => {
            it("should return the correct value for each field including primary key", () => {
                this.value.id.should.equal("A");
                this.value.title.should.equal("Clean room");
                this.value.isDone.should.be.false;
            });
        });

        describe("when setting", () => {
            describe("the primary key field", () => {
                beforeEach(() => {
                    this.setPrimaryKeyValue = () => {
                        this.value.id = "HACKED";
                    };
                });
                it("should not allow the primary key field to be modified", () => {
                    this.setPrimaryKeyValue.should.throw(Error);
                });
            });

            describe("a field", () => {
                beforeEach(() => {
                    this.value.title = "New title";
                    this.value.isDone = true;
                });

                it("should return the new values", () => {
                    this.value.title.should.equal("New title");
                    this.value.isDone.should.be.true;
                });
            });

            describe("a field and with a listener attached", () => {
                beforeEach(() => {
                    this.onChanged = sinon.stub();
                    this.value.on("changed", this.onChanged);
                    this.value.isDone = true;
                });

                it("should call the listener", () => {
                    this.onChanged.should.have.been.calledWith(
                        sinon.match({ isDone: true })
                    );
                });
            });
        });
    });
});

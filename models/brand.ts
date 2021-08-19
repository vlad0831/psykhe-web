import { IBrand } from "~/types/product/product";

export class Brand {
  spec: IBrand;

  constructor(spec: IBrand) {
    this.spec = spec;
  }

  get identifier() {
    return this.spec.identifier;
  }

  get name() {
    return this.spec.name;
  }

  get urlPath() {
    return '/browse?brands=' + this.spec.identifier;
  }
}

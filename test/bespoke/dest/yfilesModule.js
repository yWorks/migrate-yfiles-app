import * as yfiles_module_demo from "yfiles.module('demo')";

export const MyClass = class MyClass {
  constructor() {
    this.blub = 'blob';
  }
};

export const MySecondClass = class MySecondClass {
  constructor() {
    this.blab = 'bleb';
  }
};

export const GlobalClass = class GlobalClass {
  constructor() {
    this.IAmAvailableGlobally = true;
  }
};

const demo = yfiles_module_demo;

const d = new demo.MyClass();

console.log(d.blub)

const globalThing = new globalModule.GlobalClass();

console.log(globalThing.IAmAvailableGlobally)

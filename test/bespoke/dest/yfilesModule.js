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

var demo = yfiles_module_demo

var d = new demo.MyClass()

console.log(d.blub)

var globalThing = new globalModule.GlobalClass()

console.log(globalThing.IAmAvailableGlobally)

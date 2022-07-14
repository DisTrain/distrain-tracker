"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduler = void 0;
const Singleton_1 = require("./Singleton");
let scheduler = class scheduler {
    constructor() {
        this.start = this.start.bind(this);
    }
    start() {
        console.log('scheduler started');
        setInterval(() => {
            console.log('scheduler tick');
        }, 1000);
    }
};
scheduler = __decorate([
    Singleton_1.Singleton
], scheduler);
exports.scheduler = scheduler;

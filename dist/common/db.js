"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBClient = void 0;
const Singleton_1 = require("./Singleton");
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
let DBClient = class DBClient {
    constructor() {
        this.client = neo4j_driver_1.default.driver(process.env.DB_HOST, neo4j_driver_1.default.auth.basic(process.env.DB_USERNAME, process.env.DB_PASSWORD));
        this._connect();
    }
    _connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.verifyConnectivity();
                console.log('Driver created');
            }
            catch (error) {
                console.log(`connectivity verification failed. ${error}`);
            }
        });
    }
    getSession() {
        return this.client.session();
    }
    closeConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.close();
        });
    }
};
DBClient = __decorate([
    Singleton_1.Singleton
], DBClient);
exports.DBClient = DBClient;

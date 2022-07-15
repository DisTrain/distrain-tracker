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
exports.DeviceRepository = void 0;
const db_1 = require("../common/db");
const Singleton_1 = require("../common/Singleton");
//import { createClient, RedisClientType } from 'redis'
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const DeviceStatus_1 = require("./DeviceStatus");
let DeviceRepository = class DeviceRepository {
    constructor(url) {
        //this.client = createClient({ url });
        this.socketStore = new Map();
        this.dbClient = new db_1.DBClient();
        this.devices = [];
        // this.client.on('error', (err) =>
        // {
        // 	console.error("Redis Client Error: ", err);
        // });
        //this._connect();
    }
    // private async _connect()
    // {
    // 	try
    // 	{
    // 		await this.client.connect();
    // 	} catch (err)
    // 	{
    // 		console.error("Couldn't connect to redis: ", err);
    // 	}
    // }
    _makeEditString(object, varName) {
        return Object.entries(object)
            .filter(([k, v]) => k !== 'id' && v !== undefined)
            .reduce((acc, [k, _], i, a) => {
            if (acc === '')
                acc += 'SET ';
            acc += `${varName}.${k} = $${k}${(i < a.length - 1) ? ',' : ''} `;
            return acc;
        }, '');
    }
    createDevice(device) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            try {
                yield session.writeTransaction(tx => tx.run("CREATE (newDevice:DEVICE) SET newDevice.id = $id, newDevice.address = $address, newDevice.status = $status, newDevice.last_login = $last_login, newDevice.memMeg = $memMeg", Object.assign(Object.assign({}, device), { last_login: neo4j_driver_1.default.types.DateTime.fromStandardDate(device.last_login) })));
                this.devices.push(device);
            }
            catch (err) {
                console.error("Neo4J store error", err);
            }
            finally {
                session.close();
            }
        });
    }
    getAllDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            let devices = [];
            try {
                const res = yield session.readTransaction(tx => tx.run("MATCH (d:DEVICE)  RETURN d "));
                devices = res.records.map(record => (Object.assign({}, record.get('d').properties)));
            }
            catch (err) {
                console.error(`Neo4j GET devices Error: `, err);
            }
            finally {
                session.close();
            }
            return devices;
        });
    }
    updateDevice(device) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            const lastLoginDate = (_a = device.last_login) !== null && _a !== void 0 ? _a : new Date();
            try {
                const editString = this._makeEditString(device, 'd');
                const editObject = Object.assign(Object.assign({}, device), { last_login: neo4j_driver_1.default.types.DateTime.fromStandardDate(lastLoginDate) });
                const res = yield session.writeTransaction(tx => tx.run(`MATCH (d:DEVICE {id: $id}) ${editString} RETURN d`, editObject));
                console.log("Device status and login updated: ", editObject);
            }
            catch (err) {
                console.error(`Neo4j Update Error: `, err);
            }
            finally {
                console.log(`Device updated ${device.id}`);
                session.close();
            }
        });
    }
    // public async setStatus(key: string, value: DeviceStatus)
    // {
    // 	try
    // 	{
    // 		await this.client.set(`${key}`, `${value}`);
    // 	} catch (err)
    // 	{
    // 		console.error(`Couldn't set value of ${key} to redis: `, err);
    // 	}
    // }
    // public async getStatus(key: string): Promise<DeviceStatus | null>
    // {
    // 	try
    // 	{
    // 		return await this.client.get(key) as DeviceStatus;
    // 	} catch (err)
    // 	{
    // 		console.error(`Couldn't get value of ${key} from redis: `, err);
    // 		return null
    // 	}
    // }
    getNIdleDevices(n) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            let devices = [];
            try {
                const res = yield session.readTransaction(tx => tx.run("MATCH (d:DEVICE) WHERE d.status = \"idle\" RETURN d LIMIT $n", { n }));
                devices = res.records.map(record => (Object.assign({}, record.get('d').properties)));
            }
            catch (err) {
                console.error("Neo4j Read error: ", err);
            }
            return devices;
        });
    }
    connectDeviceToTask(deviceId, taskId, number) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            try {
                yield session.writeTransaction((tx) => tx.run(`MATCH (d:DEVICE {id: $deviceId}), (t:TASK {id: $taskId}) CREATE (d)-[r:WORKS_ON {number: $number}]->(t)`, { deviceId, taskId, number }));
            }
            catch (err) {
                console.error("Neo4j connect error", err);
            }
            finally {
                session.close();
            }
        });
    }
    disconnectDeviceFromTask(deviceId, taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            try {
                yield session.writeTransaction((tx) => tx.run(`MATCH (d:DEVICE {id: $deviceId})-[r:WORKS_ON]->(t:TASK {id: $taskId}) DELETE r`, { deviceId, taskId }));
            }
            catch (err) {
                console.error("Neo4j disconnect error", err);
            }
            finally {
                session.close();
            }
        });
    }
    makeDevicesMesh(sourceId, otherDevicesId, taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                otherDevicesId.forEach((deviceId) => __awaiter(this, void 0, void 0, function* () {
                    const session = (new db_1.DBClient()).getSession();
                    yield session.writeTransaction((tx) => tx.run(`MATCH (source:DEVICE {id: $sourceId}), (destination:DEVICE {id: $deviceId}) CREATE (source)-[r:WORKS_WITH {taskId: $taskId}]->(destination)`, {
                        sourceId,
                        deviceId,
                        taskId,
                    }));
                    yield session.close();
                }));
            }
            catch (err) {
                console.error("Neo4j mesh error", err);
            }
            finally {
                //session.close();
            }
        });
    }
    resetAllDevicesStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            try {
                const res = yield session.writeTransaction(tx => tx.run(`MATCH (d:DEVICE) SET d.status="${DeviceStatus_1.DISCONNECTED}" RETURN d`));
                console.log("All devices are diconnected");
            }
            catch (err) {
                console.error(`Neo4j Update Error: `, err);
            }
            finally {
                session.close();
            }
        });
    }
    setSocket(id, socket) {
        this.socketStore.set(id, socket);
    }
    getSocket(id) {
        return this.socketStore.get(id);
    }
    disconnectDevice(deviceId) {
        this.updateDevice({
            id: deviceId,
            status: "disconnected",
        });
        //this.setStatus(deviceId, "disconnected");
        this.setSocket(deviceId, null);
    }
};
DeviceRepository = __decorate([
    Singleton_1.Singleton
], DeviceRepository);
exports.DeviceRepository = DeviceRepository;

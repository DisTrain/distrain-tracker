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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRepository = void 0;
const db_1 = require("../common/db");
const Singleton_1 = require("../common/Singleton");
let TaskRepository = class TaskRepository {
    constructor() {
        this.dbClient = new db_1.DBClient();
    }
    addTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            try {
                yield session.writeTransaction((tx) => tx.run("CREATE (newTask:TASK) SET newTask.id = $id, newTask.devices_count = $devices_count, newTask.params = $params, newTask.status = $status, newTask.dataType = $dataType, newTask.dataTypeParams = $dataTypeParams, newTask.multipleFiles = $multipleFiles", task));
            }
            catch (err) {
                console.error("Neo4J store error", err);
            }
            finally {
                console.log("task stored successfully");
                session.close();
            }
        });
    }
    updateTask(taskId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            try {
                yield session.writeTransaction((tx) => tx.run("MATCH (t:TASK {id: $taskId}) SET t.status = $status", { taskId, status }));
            }
            catch (err) {
                console.error("Neo4J store error", err);
            }
            finally {
                console.log("task updated successfully");
                session.close();
            }
        });
    }
    getMinTask() {
        return __awaiter(this, void 0, void 0, function* () {
            const session = (new db_1.DBClient()).getSession();
            let task = null;
            try {
                const res = yield session.readTransaction((tx) => tx.run(`MATCH (t:TASK) RETURN t ORDER BY t.devices_count LIMIT 1`));
                const rec = res.records[0].get("t");
                task = Object.assign({}, rec.properties);
            }
            catch (err) {
                console.error(err);
            }
            return task;
        });
    }
};
TaskRepository = __decorate([
    Singleton_1.Singleton
], TaskRepository);
exports.TaskRepository = TaskRepository;

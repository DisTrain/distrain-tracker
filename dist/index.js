"use strict";
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
const WorkMessage_1 = require("./message/WorkMessage");
const TaskRepository_1 = require("./task/TaskRepository");
const DeviceRepository_1 = require("./device/DeviceRepository");
const MessageFactory_1 = require("./message/MessageFactory");
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
dotenv_1.default.config();
const apiPort = +(process.env.PORT ? process.env.PORT : 8000);
const deviceRepo = new DeviceRepository_1.DeviceRepository(undefined);
const taskRepo = new TaskRepository_1.TaskRepository();
const s3 = new client_s3_1.S3Client({
    region: "us-west-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID : "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY : "",
    },
});
const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log(req.url, req.method);
    if (req.url === "/task" && req.method === "POST") {
        /*
                1- save task in db
                2- run scheduler or write in-place here
                    2.1- check if #devices is sufficient
                    2.2- if not, return error
                    2.3- if yes, loop to all devices and send task, list of all peers[id -> address], expiry model & chuck urls
            */
        const size = parseInt(req.headers["content-length"], 10);
        const buffer = Buffer.allocUnsafe(size);
        let pos = 0;
        req
            .on("data", (chunk) => {
            chunk.copy(buffer, pos);
            pos += chunk.length;
        })
            .on("end", () => __awaiter(this, void 0, void 0, function* () {
            const data = JSON.parse(buffer.toString());
            let task = {
                //id: uuid(),
                id: "test-123",
                devices_count: data.devices_count,
                dataType: data.data_type,
                dataTypeParams: data.data_type_params,
                multipleFiles: data.multiple_files,
                params: data.params,
                status: "new",
            };
            yield taskRepo.addTask(task);
            const metadataCommand = new client_s3_1.GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: `${task.id}/m.json`,
            });
            const metadataUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, metadataCommand, { expiresIn: Number(process.env.S3_URL_EXPIRY) });
            let chunksUrl = [];
            for (let i = 0; i < task.devices_count; i++) {
                const chunkCommand = new client_s3_1.GetObjectCommand({
                    Bucket: process.env.S3_BUCKET,
                    Key: `${task.id}/c${i + 1}.zip`,
                });
                chunksUrl.push(yield (0, s3_request_presigner_1.getSignedUrl)(s3, chunkCommand, { expiresIn: Number(process.env.S3_URL_EXPIRY) }));
            }
            const response = {
                message: "please put your files inside a folder named with given task id",
                task,
                data,
                metadataUrl,
                chunksUrl,
            };
            console.log("========================= scheduler started =========================");
            yield schedule();
            res.end(JSON.stringify(response));
        }));
    }
    else if (req.url == "/devices" && req.method === "GET") {
        req
            .on("data", () => { })
            .on("end", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield deviceRepo.getAllDevices();
            res.end(JSON.stringify(response));
        }));
    }
    else if (req.url == "/task2" && req.method === "POST") {
        const size = parseInt(req.headers["content-length"], 10);
        const buffer = Buffer.allocUnsafe(size);
        let pos = 0;
        req
            .on("data", (chunk) => {
            chunk.copy(buffer, pos);
            pos += chunk.length;
        })
            .on("end", () => __awaiter(this, void 0, void 0, function* () {
            const data = JSON.parse(buffer.toString());
            console.log(data);
            let task = {
                //id: uuid(),
                id: data.task_name,
                devices_count: data.devs.length,
                dataType: "csv",
                dataTypeParams: "",
                multipleFiles: false,
                params: "aa",
                status: "new",
            };
            yield taskRepo.addTask(task);
            const metadataCommand = new client_s3_1.GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: `${task.id}/${data.model_name}`,
            });
            const metadataUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, metadataCommand, { expiresIn: Number(process.env.S3_URL_EXPIRY) });
            let chunksUrl = [];
            for (let i = 0; i < task.devices_count; i++) {
                const chunkCommand = new client_s3_1.GetObjectCommand({
                    Bucket: process.env.S3_BUCKET,
                    Key: `${task.id}/${data.devs[i].chunk}.zip`,
                });
                chunksUrl.push(yield (0, s3_request_presigner_1.getSignedUrl)(s3, chunkCommand, { expiresIn: Number(process.env.S3_URL_EXPIRY) }));
            }
            const response = {
                message: "please put your files inside a folder named with given task id",
                task,
                data,
                metadataUrl,
                chunksUrl,
            };
            console.log("========================= scheduler started =========================");
            yield schedule2(data);
            res.end(JSON.stringify(response));
        }));
    }
    else if (req.url == "/finish" && req.method === "POST") {
        const size = parseInt(req.headers["content-length"], 10);
        const buffer = Buffer.allocUnsafe(size);
        let pos = 0;
        req
            .on("data", (chunk) => {
            chunk.copy(buffer, pos);
            pos += chunk.length;
        })
            .on("end", () => __awaiter(this, void 0, void 0, function* () {
            const data = JSON.parse(buffer.toString());
            console.log(data);
            res.end("done");
        }));
    }
};
deviceRepo.resetAllDevicesStatus();
const httpServer = http_1.default.createServer(requestListener);
const wss = new ws_1.WebSocket.Server({ server: httpServer });
httpServer.listen(apiPort, () => {
    console.log(`API Listening on port ${apiPort}`);
});
wss.on("listening", () => {
    console.log(`Socket Listening on port ${apiPort}`);
});
wss.on("connection", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    let deviceId = req.headers["x-device-id"] || "";
    let deviceAddress = req.headers["x-device-address"] || "";
    let availableMemMegs = req.headers["x-device-mem"] || "";
    deviceId = (0, uuid_1.v4)();
    console.log("New device: ", deviceId);
    yield deviceRepo.createDevice({
        id: deviceId,
        status: "idle",
        last_login: new Date(Date.now()),
        address: deviceAddress,
        memMeg: availableMemMegs,
    });
    ws.send(JSON.stringify({ type: "deviceId", data: deviceId }));
    deviceRepo.setSocket(deviceId, ws);
    ws.addEventListener("message", (message) => {
        console.log("tracker received msg: ", message.data);
        const msgInstance = MessageFactory_1.MessageFactory.createMessage(ws, message.data, s3);
        msgInstance === null || msgInstance === void 0 ? void 0 : msgInstance.handle();
    });
    ws.addEventListener("close", ({ code }) => {
        console.log(`Socket ${deviceId} closing ... Code`, code);
        deviceRepo.disconnectDevice(deviceId);
    });
    ws.addEventListener("error", (err) => {
        console.log(`Socket ${deviceId} error`);
        console.log(err);
        deviceRepo.disconnectDevice(deviceId);
    });
}));
function schedule() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the task with the least no of required mobiles
        const minTask = yield taskRepo.getMinTask();
        console.log(minTask);
        if (minTask) {
            const idleDevices = yield deviceRepo.getNIdleDevices(minTask.devices_count); // Should be connected devices and not busy
            const devicesList = idleDevices.map((d, i) => (Object.assign({ number: i }, d)));
            console.log(devicesList);
            let socket;
            if (idleDevices.length >= minTask.devices_count) {
                // Generate URL for metadata file
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: process.env.S3_BUCKET,
                    Key: `${minTask.id}/m.json`,
                });
                const metadataUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: Number(process.env.S3_URL_EXPIRY) });
                for (let [i, dev] of devicesList.entries()) {
                    //  Get device socket
                    console.log("dev1", dev);
                    let otherDevicesList = devicesList.map((d) => ({ number: d.number, address: d.address })).sort((a, b) => a.number - b.number);
                    console.log(otherDevicesList);
                    socket = deviceRepo.getSocket(dev.id);
                    // Prepare the message
                    const command = new client_s3_1.GetObjectCommand({
                        Bucket: process.env.S3_BUCKET,
                        Key: `${minTask.id}/c${i + 1}.zip`,
                    });
                    const chunkUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: Number(process.env.S3_URL_EXPIRY) });
                    const data = {
                        task_id: minTask.id,
                        number: dev.number,
                        metadata_url: metadataUrl,
                        chunk_url: chunkUrl,
                        data_type: minTask.dataType,
                        data_type_params: minTask.dataTypeParams,
                        devices_list: otherDevicesList,
                    };
                    console.log("data", data);
                    if (socket) {
                        // Send the work message
                        const msg = new WorkMessage_1.WorkMessage(socket, JSON.stringify(data));
                        msg.handle();
                        //await deviceRepo.setStatus(dev.id, "busy");
                        // construct device mesh of network
                        yield deviceRepo.connectDeviceToTask(dev.id, minTask.id, dev.number);
                        // connect working devices to their task
                        const otherDevicesId = devicesList.filter((d) => d.id !== dev.id).map((d) => d.id);
                        yield deviceRepo.makeDevicesMesh(dev.id, otherDevicesId, minTask.id);
                    }
                    else {
                        return false;
                    }
                    console.log(`Sent chunk ${i} to ${dev.id}`);
                }
                yield taskRepo.updateTask(minTask.id, "ongoing");
            }
        }
    });
}
function schedule2(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const devicesList = data.devs.map((d, i) => (Object.assign(Object.assign({ number: i }, d), { address: d.ip })));
        console.log(devicesList);
        let socket;
        // Generate URL for metadata file
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `${data.task_name}/${data.model_name}`,
        });
        const metadataUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: Number(process.env.S3_URL_EXPIRY) });
        const commandTFLite = new client_s3_1.GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `${data.task_name}/${data.tf_lite_metadata}`,
        });
        const metadataTFLite = yield (0, s3_request_presigner_1.getSignedUrl)(s3, commandTFLite, { expiresIn: Number(process.env.S3_URL_EXPIRY) });
        for (let [i, dev] of devicesList.entries()) {
            //console.log("dev",dev);
            //  Get device socket
            let otherDevicesList = devicesList.map((d) => ({ number: d.number, address: d.address })).sort((a, b) => a.number - b.number);
            //console.log("other",otherDevicesList)
            socket = deviceRepo.getSocket(dev.id);
            // Prepare the message
            const command = new client_s3_1.GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: `${data.task_name}/${data.devs[i].chunk}.zip`,
            });
            const chunkUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: Number(process.env.S3_URL_EXPIRY) });
            const data1 = {
                task_id: data.task_name,
                number: dev.number,
                metadata_url: metadataUrl,
                chunk_url: chunkUrl,
                data_type: "csv",
                data_type_params: "a=k",
                devices_list: otherDevicesList,
                is_tf_lite: data.is_tf_lite,
                tf_lite_metadata: metadataTFLite,
            };
            //console.log("data1",data1)
            if (socket) {
                // Send the work message
                const msg = new WorkMessage_1.WorkMessage(socket, JSON.stringify(data1));
                msg.handle();
                //await deviceRepo.setStatus(dev.id, "busy");
                // construct device mesh of network
                yield deviceRepo.connectDeviceToTask(dev.id, data.task_name, dev.number);
                // connect working devices to their task
                const otherDevicesId = devicesList.filter((d) => d.id !== dev.id).map((d) => d.id);
                yield deviceRepo.makeDevicesMesh(dev.id, otherDevicesId, data.task_name);
            }
            else {
                return false;
            }
            console.log(`Sent chunk ${i} to ${dev.id}`);
        }
        yield taskRepo.updateTask(data.task_name, "ongoing");
    });
}

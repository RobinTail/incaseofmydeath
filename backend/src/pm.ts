import pm2 from "pm2";

const disposerProcessName = "Disposer";

export interface ProcessMessage {
  code: "onConnected";
  channel: "telegram";
  payload: string;
}

export interface Packet {
  topic: true;
  type: "process:msg";
  data: unknown;
}

export const isProcessMessage = (
  subject: unknown,
): subject is ProcessMessage => {
  return (
    typeof subject === "object" &&
    subject !== null &&
    "code" in subject &&
    "channel" in subject &&
    "payload" in subject
  );
};

export const isPacket = (subject: unknown): subject is Packet => {
  return (
    typeof subject === "object" &&
    subject !== null &&
    "topic" in subject &&
    "type" in subject &&
    "data" in subject
  );
};

export interface ProcessManager {
  disposerProcess: pm2.ProcessDescription;
  send: (entry: pm2.ProcessDescription, data: ProcessMessage) => void;
}

export const createProcessManager = () => {
  return new Promise<ProcessManager>((resolve, reject) => {
    pm2.connect((errConnect) => {
      if (errConnect) {
        reject(errConnect);
        return;
      }
      pm2.list((errList, processList) => {
        if (errList) {
          reject(errList);
          return;
        }
        const disposerProcess = processList.find(
          (item) => item.name === disposerProcessName,
        );
        if (!disposerProcess) {
          reject(new Error(`Can not find ${disposerProcessName} process`));
          return;
        }
        const send: ProcessManager["send"] = (entity, data) => {
          if (entity.pm_id) {
            pm2.sendDataToProcessId(
              entity.pm_id,
              <Packet>{
                topic: true,
                type: "process:msg",
                data,
              },
              () => {},
            );
          }
        };
        resolve({ disposerProcess, send });
      });
    });
  });
};

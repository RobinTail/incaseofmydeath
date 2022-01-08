import pm2 from "pm2";

const disposerProcessName = "Disposer";

export interface ProcessMessage {
  code: "onConnected";
  channel: "telegram";
  payload: string;
}

export const isProcessMessage = (
  subject: unknown
): subject is ProcessMessage => {
  return (
    typeof subject === "object" &&
    subject !== null &&
    "code" in subject &&
    "channel" in subject &&
    "payload" in subject
  );
};

export const createProcessManager = () => {
  return new Promise((resolve, reject) => {
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
          (item) => item.name === disposerProcessName
        );
        if (!disposerProcess) {
          reject(new Error(`Can not find ${disposerProcessName} process`));
          return;
        }
        const send = (entity: pm2.ProcessDescription, data: ProcessMessage) => {
          if (entity.pid) {
            pm2.sendDataToProcessId(
              entity.pid,
              {
                topic: true,
                type: "process:msg",
                data,
              },
              () => {}
            );
          }
        };
        resolve({ disposerProcess, send });
      });
    });
  });
};

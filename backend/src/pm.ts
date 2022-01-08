import pm2 from "pm2";
import { promisify } from "util";

const connect = promisify(pm2.connect);
const list = promisify(pm2.list);
const sendDataToProcessId = promisify(pm2.sendDataToProcessId);

const telegramBotProcessName = "TelegramBot";

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

export const createProcessManager = async () => {
  await connect();
  const processList = await list();
  const botProcess = processList.find(
    (item) => item.name === telegramBotProcessName
  );
  if (!botProcess) {
    throw new Error(`Can not find ${telegramBotProcessName} process`);
  }
  const send = async (entity: pm2.ProcessDescription, data: ProcessMessage) => {
    if (entity.pid) {
      await sendDataToProcessId(entity.pid, {
        topic: true,
        type: "process:msg",
        data,
      });
    }
  };
  return { botProcess, send };
};

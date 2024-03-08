import { UserDocument } from "./db.js";

export type AliveHook = (user: UserDocument) => Promise<void>;

export interface Channel {
  onConnected(user: UserDocument): Promise<void>;
  ask(user: UserDocument): Promise<void>;
  rip(user: UserDocument): Promise<void>;
}

import mongoose, { Model, Schema } from "mongoose";
import { mongo } from "./config";
import { CheckFreqCode, checkFreqCodes, msInDay } from "./const";
import { checkFreqToDays } from "./utils";

export type ModelType<T> = T extends Model<infer R> ? R : never;

export const connection =
  process.env.ENV == "TEST"
    ? Promise.resolve()
    : mongoose.connect(mongo.connectionString);

const defaultDeadline = 5;
const defaultAttempts = 3;
const defaultCheckFreq: CheckFreqCode = "month";

const userSchema = new Schema<{
  id: number;
  installationId: number;
  repo: { owner: string; name: string; branch: string };
  workflowId: number;
  isAlive: boolean;
  isPublic: boolean;
  checkFreq: CheckFreqCode;
  deadlineDays: number;
  attemptsCount: number;
  nextCheck: Date;
  lastConfirmation: Date;
  telegramChatId?: string;
}>({
  id: { type: Schema.Types.Number, unique: true },
  installationId: { type: Schema.Types.Number },
  repo: {
    owner: { type: Schema.Types.String },
    name: { type: Schema.Types.String },
    branch: { type: Schema.Types.String },
  },
  workflowId: { type: Schema.Types.Number },
  isAlive: { type: Schema.Types.Boolean, default: true },
  isPublic: { type: Schema.Types.Boolean, default: false },
  checkFreq: {
    type: Schema.Types.String,
    enum: Object.keys(checkFreqCodes),
    default: defaultCheckFreq,
  },
  deadlineDays: { type: Schema.Types.Number, default: defaultDeadline },
  attemptsCount: { type: Schema.Types.Number, default: defaultAttempts },
  nextCheck: {
    type: Schema.Types.Date,
    default: () =>
      new Date(Date.now() + checkFreqToDays(defaultCheckFreq) * msInDay), // regular schedule
  },
  lastConfirmation: { type: Schema.Types.Date, default: () => new Date() },
  telegramChatId: { type: Schema.Types.String },
})
  .index({ isAlive: 1, nextCheck: 1 })
  .index({ telegramChatId: 1 });

export const Users = mongoose.model("Users", userSchema, "users");

const userFindFn = () => Users.findOne({}).exec();

export type UserDocument = NonNullable<Awaited<ReturnType<typeof userFindFn>>>;

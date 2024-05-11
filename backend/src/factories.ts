import { defaultEndpointsFactory } from "express-zod-api";
import { app } from "./app.js";
import { github } from "./config.js";
import {
  authorizedUserProviderMiddleware,
  installationProviderMiddleware,
  processManagerProviderMiddleware,
  publicUserProviderByIdMiddleware,
  publicUserProviderByLoginMiddleware,
} from "./middlewares.js";

export const endpointsFactory = defaultEndpointsFactory;

export const appProviderFactory = endpointsFactory.addOptions(async () => ({
  app,
  github,
}));

export const installationProviderFactory = endpointsFactory.addMiddleware(
  installationProviderMiddleware,
);

export const authorizedUserFactory = endpointsFactory
  .addMiddleware(authorizedUserProviderMiddleware)
  .addMiddleware(processManagerProviderMiddleware);

export const publicUserByIdFactory = endpointsFactory.addMiddleware(
  publicUserProviderByIdMiddleware,
);

export const publicUserByLoginFactory = endpointsFactory.addMiddleware(
  publicUserProviderByLoginMiddleware,
);

export const publicUserWithInstallationFactory =
  publicUserByIdFactory.addMiddleware(installationProviderMiddleware);

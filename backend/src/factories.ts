import { defaultEndpointsFactory } from "express-zod-api";
import { app } from "./app.js";
import { github } from "./config.js";
import { Users } from "./db.js";
import {
  authorizedUserProviderMiddleware,
  installationProviderMiddleware,
  processManagerProviderMiddleware,
  publicUserProviderByIdMiddleware,
  publicUserProviderByLoginMiddleware,
} from "./middlewares.js";

export const endpointsFactory = defaultEndpointsFactory;

export const appProviderFactory = endpointsFactory.addOptions({
  app,
  github,
});

export const installationProviderFactory = endpointsFactory
  .addMiddleware(installationProviderMiddleware)
  .addOptions({ Users });

export const authorizedUserFactory = endpointsFactory
  .addMiddleware(authorizedUserProviderMiddleware)
  .addMiddleware(processManagerProviderMiddleware)
  .addOptions({ Users });

export const publicUserByIdFactory = endpointsFactory.addMiddleware(
  publicUserProviderByIdMiddleware,
);

export const publicUserByLoginFactory = endpointsFactory.addMiddleware(
  publicUserProviderByLoginMiddleware,
);

export const publicUserWithInstallationFactory =
  publicUserByIdFactory.addMiddleware(installationProviderMiddleware);

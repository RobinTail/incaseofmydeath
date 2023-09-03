import { defaultEndpointsFactory } from "express-zod-api";
import { app } from "./app";
import { github } from "./config";
import { Users } from "./db";
import {
  authorizedUserProviderMiddleware,
  installationProviderMiddleware,
  processManagerProviderMiddleware,
  publicUserProviderByIdMiddleware,
  publicUserProviderByLoginMiddleware,
} from "./middlewares";

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

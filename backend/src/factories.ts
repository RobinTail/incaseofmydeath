import { defaultEndpointsFactory } from "express-zod-api";
import { app } from "./app";
import { github } from "./config";
import { Users } from "./db";
import {
  authorizedUserProviderMiddleware,
  installationProviderMiddleware,
  processManagerProviderMiddleware,
  publicUserProviderMiddleware,
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

export const publicUserFactory = endpointsFactory.addMiddleware(
  publicUserProviderMiddleware
);

export const publicUserWithInstallationFactory =
  publicUserFactory.addMiddleware(installationProviderMiddleware);

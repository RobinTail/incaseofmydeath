import { defaultEndpointsFactory } from "express-zod-api";
import {
  authorizedUserProviderMiddleware,
  installationProviderMiddleware,
  processManagerProviderMiddleware,
  publicUserProviderByIdMiddleware,
  publicUserProviderByLoginMiddleware,
} from "./middlewares.js";

export const endpointsFactory = defaultEndpointsFactory;

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

export const paths = {
  root: "/",
  personalArea: "/personal",
  publicStatus: "/status/:userId",
};

export const replacePathsParams = (
  path: string,
  params: Record<string, string>,
) => {
  let result = `${path}`;
  Object.keys(params).forEach((key) => {
    result = result.replace(`:${key}`, params[key]);
  });
  return result;
};

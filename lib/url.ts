export function getBaseUrl(): string {
  if (process.env.VERCEL_ENV) {
    if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_BRANCH_URL) {
      return `https://${process.env.VERCEL_BRANCH_URL}`;
    }
  }
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

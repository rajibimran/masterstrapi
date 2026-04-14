import path from 'path';
import type { Core } from '@strapi/strapi';

/**
 * Default: SQLite (simple local/small deployments).
 * Set DATABASE_CLIENT=postgres and DATABASE_URL (or discrete DATABASE_* fields) for PostgreSQL.
 */
export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const databaseUrl = (env('DATABASE_URL', '') || '').trim();

  const connections: Record<
    string,
    { connection: Record<string, unknown>; pool?: { min: number; max: number }; useNullAsDefault?: boolean }
  > = {
    postgres: {
      connection: databaseUrl
        ? {
            connectionString: databaseUrl,
            schema: env('DATABASE_SCHEMA', 'public'),
            ...(env.bool('DATABASE_SSL', false)
              ? {
                  ssl: {
                    key: env('DATABASE_SSL_KEY', undefined),
                    cert: env('DATABASE_SSL_CERT', undefined),
                    ca: env('DATABASE_SSL_CA', undefined),
                    capath: env('DATABASE_SSL_CAPATH', undefined),
                    cipher: env('DATABASE_SSL_CIPHER', undefined),
                    rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
                  },
                }
              : {}),
          }
        : {
            host: env('DATABASE_HOST', 'localhost'),
            port: env.int('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'strapi'),
            user: env('DATABASE_USERNAME', 'strapi'),
            password: env('DATABASE_PASSWORD', 'strapi'),
            schema: env('DATABASE_SCHEMA', 'public'),
            ...(env.bool('DATABASE_SSL', false)
              ? {
                  ssl: {
                    key: env('DATABASE_SSL_KEY', undefined),
                    cert: env('DATABASE_SSL_CERT', undefined),
                    ca: env('DATABASE_SSL_CA', undefined),
                    capath: env('DATABASE_SSL_CAPATH', undefined),
                    cipher: env('DATABASE_SSL_CIPHER', undefined),
                    rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
                  },
                }
              : {}),
          },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  const selected = connections[client];
  if (!selected) {
    throw new Error(
      `Unsupported DATABASE_CLIENT="${client}". Use "sqlite" (default) or "postgres".`
    );
  }

  return {
    connection: {
      client: client as 'sqlite' | 'postgres',
      ...selected,
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  } as Core.Config.Database;
};

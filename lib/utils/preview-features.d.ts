/**
 * Connector types from Prisma's generator-helper
 * Note: Prisma uses "postgres" not "postgresql" in the datasources array
 */
type ConnectorType = "postgres" | "postgresql" | "mysql" | "mongodb" | "sqlite" | "sqlserver" | "cockroachdb";
/**
 * Normalizes preview features based on Prisma version and database provider.
 *
 * Prisma full-text search evolution:
 * - Prisma 5: Uses `fullTextSearch` for all databases
 * - Prisma 6+: PostgreSQL uses `fullTextSearchPostgres` (preview), MySQL uses `fullTextSearch` (GA)
 *
 * This function ensures compatibility across versions by automatically transforming feature names.
 *
 * @param previewFeatures - Array of preview feature names from the schema
 * @param prismaVersion - Installed Prisma version (e.g., "5.18.0", "6.0.0", "6.19.0")
 * @param connectorType - Database provider type (e.g., "postgresql", "mysql")
 * @returns Normalized array of preview features for getDMMF()
 *
 * @example
 * // Prisma 5 + PostgreSQL - no transformation
 * normalizePreviewFeatures(["fullTextSearch"], "5.18.0", "postgres")
 * // => ["fullTextSearch"]
 *
 * @example
 * // Prisma 6+ + PostgreSQL - transform to fullTextSearchPostgres
 * normalizePreviewFeatures(["fullTextSearch"], "6.0.0", "postgres")
 * // => ["fullTextSearchPostgres"]
 *
 * @example
 * // Prisma 6+ + MySQL - no transformation (GA)
 * normalizePreviewFeatures(["fullTextSearch"], "6.0.0", "mysql")
 * // => ["fullTextSearch"]
 */
export declare function normalizePreviewFeatures(previewFeatures: string[], prismaVersion: string, connectorType: ConnectorType): string[];
export {};

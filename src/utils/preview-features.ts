import * as semver from "semver";

/**
 * Connector types that support full-text search
 */
type ConnectorType = "postgresql" | "mysql" | "mongodb" | "sqlite" | "sqlserver" | "cockroachdb";

/**
 * Normalizes preview features based on Prisma version and database provider.
 *
 * In Prisma 6:
 * - PostgreSQL: `fullTextSearch` must be renamed to `fullTextSearchPostgres`
 * - MySQL: `fullTextSearch` is now GA (no preview feature needed, but we keep it for compatibility)
 *
 * This function ensures backward compatibility with Prisma 5 while supporting Prisma 6+.
 *
 * @param previewFeatures - Array of preview feature names from the schema
 * @param prismaVersion - Installed Prisma version (e.g., "5.18.0", "6.0.0")
 * @param connectorType - Database provider type (e.g., "postgresql", "mysql")
 * @returns Normalized array of preview features for getDMMF()
 *
 * @example
 * // Prisma 5 + PostgreSQL - no transformation
 * normalizePreviewFeatures(["fullTextSearch"], "5.18.0", "postgresql")
 * // => ["fullTextSearch"]
 *
 * @example
 * // Prisma 6 + PostgreSQL - transform to new feature name
 * normalizePreviewFeatures(["fullTextSearch"], "6.0.0", "postgresql")
 * // => ["fullTextSearchPostgres"]
 *
 * @example
 * // Prisma 6 + MySQL - no transformation (GA in v6)
 * normalizePreviewFeatures(["fullTextSearch"], "6.0.0", "mysql")
 * // => ["fullTextSearch"]
 */
export function normalizePreviewFeatures(
  previewFeatures: string[],
  prismaVersion: string,
  connectorType: ConnectorType,
): string[] {
  // Return early if no features to process
  if (!previewFeatures || previewFeatures.length === 0) {
    return [];
  }

  // Validate and parse Prisma version
  const parsedVersion = semver.coerce(prismaVersion);
  if (!parsedVersion) {
    // If version parsing fails, return original features unchanged
    // This prevents breaking changes when version detection fails
    return [...previewFeatures];
  }

  // Check if we're running Prisma 6 or higher
  const isPrisma6Plus = semver.gte(parsedVersion, "6.0.0");

  // Only apply transformations for Prisma 6+ with PostgreSQL
  if (!isPrisma6Plus || connectorType !== "postgresql") {
    return [...previewFeatures];
  }

  // Transform `fullTextSearch` -> `fullTextSearchPostgres` for PostgreSQL in Prisma 6+
  return previewFeatures.map(feature => {
    if (feature === "fullTextSearch") {
      return "fullTextSearchPostgres";
    }
    return feature;
  });
}

/**
 * Gets the installed Prisma version.
 * Exported for use in preview features normalization.
 *
 * @returns The installed Prisma version (e.g., "5.18.0", "6.0.0")
 * @returns "5.0.0" as fallback if version cannot be detected
 */
export declare function getPrismaVersion(): string;
export declare function ensureInstalledCorrectPrismaPackage(): void;

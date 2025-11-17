"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaVersion = getPrismaVersion;
exports.ensureInstalledCorrectPrismaPackage = ensureInstalledCorrectPrismaPackage;
const tslib_1 = require("tslib");
const semVer = tslib_1.__importStar(require("semver"));
function shouldSkipPrismaVersionCheck() {
    const value = process.env.SKIP_PRISMA_VERSION_CHECK;
    return value === "true" || value === "TRUE" || value === "1";
}
function getInstalledPrismaVersion() {
    const prismaPackageJson = require("prisma/package.json");
    return prismaPackageJson.version;
}
/**
 * Gets the installed Prisma version.
 * Exported for use in preview features normalization.
 *
 * @returns The installed Prisma version (e.g., "5.18.0", "6.0.0")
 * @returns "5.0.0" as fallback if version cannot be detected
 */
function getPrismaVersion() {
    try {
        return getInstalledPrismaVersion();
    }
    catch (error) {
        // Fallback to Prisma 5 behavior if version detection fails
        // This ensures backward compatibility and prevents crashes
        console.warn("Warning: Could not detect Prisma version. Falling back to Prisma 5 behavior.", error instanceof Error ? error.message : String(error));
        return "5.0.0";
    }
}
function getPeerDependencyPrismaRequirement() {
    const ownPackageJson = require("../../package.json");
    return ownPackageJson.peerDependencies["prisma"];
}
function ensureInstalledCorrectPrismaPackage() {
    if (shouldSkipPrismaVersionCheck()) {
        return;
    }
    const installedVersion = getInstalledPrismaVersion();
    const versionRequirement = getPeerDependencyPrismaRequirement();
    if (!semVer.satisfies(installedVersion, versionRequirement)) {
        throw new Error(`Looks like an incorrect version "${installedVersion}" ` +
            `of the Prisma packages has been installed. ` +
            `'typegraphql-prisma' works only with selected versions, ` +
            `so please ensure that you have installed a version of Prisma ` +
            `that meets the requirement: "${versionRequirement}". ` +
            `Find out more about that requirement in the docs: ` +
            `https://prisma.typegraphql.com/docs/basics/prisma-version`);
    }
}
//# sourceMappingURL=prisma-version.js.map
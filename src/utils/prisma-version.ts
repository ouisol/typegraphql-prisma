import * as semVer from "semver";

function shouldSkipPrismaVersionCheck() {
  const value = process.env.SKIP_PRISMA_VERSION_CHECK;
  return value === "true" || value === "TRUE" || value === "1";
}

function getInstalledPrismaVersion(): string {
  const prismaPackageJson = require("prisma/package.json");
  return prismaPackageJson.version;
}

/**
 * Gets the installed Prisma version.
 * Exported for use in preview features normalization.
 *
 * @returns The installed Prisma version (e.g., "5.18.0", "6.0.0")
 * @throws Error if prisma package is not installed
 */
export function getPrismaVersion(): string {
  return getInstalledPrismaVersion();
}

function getPeerDependencyPrismaRequirement(): string {
  const ownPackageJson = require("../../package.json");
  return ownPackageJson.peerDependencies["prisma"];
}

export function ensureInstalledCorrectPrismaPackage() {
  if (shouldSkipPrismaVersionCheck()) {
    return;
  }

  const installedVersion = getInstalledPrismaVersion();
  const versionRequirement = getPeerDependencyPrismaRequirement();

  if (!semVer.satisfies(installedVersion, versionRequirement)) {
    throw new Error(
      `Looks like an incorrect version "${installedVersion}" ` +
        `of the Prisma packages has been installed. ` +
        `'typegraphql-prisma' works only with selected versions, ` +
        `so please ensure that you have installed a version of Prisma ` +
        `that meets the requirement: "${versionRequirement}". ` +
        `Find out more about that requirement in the docs: ` +
        `https://prisma.typegraphql.com/docs/basics/prisma-version`,
    );
  }
}

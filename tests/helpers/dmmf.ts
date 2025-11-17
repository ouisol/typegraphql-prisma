import type { DMMF as PrismaDMMF } from "@prisma/generator-helper";
import { getDMMF } from "@prisma/internals";
import { getPrismaVersion } from "../../src/utils/prisma-version";
import { normalizePreviewFeatures } from "../../src/utils/preview-features";

export default async function getPrismaClientDmmfFromPrismaSchema(
  prismaSchema: string,
  previewFeatures: string[] = [],
  provider = "postgresql",
  prismaVersion?: string,
): Promise<PrismaDMMF.Document> {
  // Use provided version or detect installed version
  const version = prismaVersion || getPrismaVersion();

  // Normalize preview features for Prisma 6+ compatibility
  const normalizedFeatures = normalizePreviewFeatures(
    previewFeatures,
    version,
    provider as any,
  );

  const previewFeaturesToEmit = [...normalizedFeatures];
  const datamodelWithGeneratorBlock = /* prisma */ `
    datasource db {
      provider = "${provider}"
      url      = env("DATABASE_URL")
    }
    generator client {
      provider = "prisma-client-js"
      ${
        previewFeaturesToEmit.length > 0
          ? `previewFeatures = [${previewFeaturesToEmit
              .map(it => `"${it}"`)
              .join(", ")}]`
          : ""
      }
    }
    ${prismaSchema}
  `;
  return await getDMMF({
    datamodel: datamodelWithGeneratorBlock,
    previewFeatures: normalizedFeatures,
  });
}

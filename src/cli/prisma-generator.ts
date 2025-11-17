import { GeneratorOptions } from "@prisma/generator-helper";
import { getDMMF, parseEnvValue } from "@prisma/internals";
import { promises as asyncFs } from "fs";
import path from "path";

import generateCode from "../generator/generate-code";
import removeDir from "../utils/removeDir";
import {
  ExternalGeneratorOptions,
  InternalGeneratorOptions,
} from "../generator/options";
import { ALL_EMIT_BLOCK_KINDS } from "../generator/emit-block";
import {
  parseStringBoolean,
  parseStringArray,
  parseStringEnum,
  parseString,
} from "./helpers";
import { getPrismaVersion } from "../utils/prisma-version";
import { normalizePreviewFeatures } from "../utils/preview-features";

export async function generate(options: GeneratorOptions) {
  const outputDir = parseEnvValue(options.generator.output!);
  await asyncFs.mkdir(outputDir, { recursive: true });
  await removeDir(outputDir, true);

  const prismaClientProvider = options.otherGenerators.find(
    it => parseEnvValue(it.provider) === "prisma-client-js",
  )!;
  const prismaClientPath = parseEnvValue(prismaClientProvider.output!);

  // Get datasource provider (e.g., "postgresql", "mysql")
  const datasourceProvider = options.datasources[0]?.provider || "postgresql";

  // Normalize preview features for Prisma 6+ compatibility
  // Automatically maps fullTextSearch -> fullTextSearchPostgres for PostgreSQL
  const prismaVersion = getPrismaVersion();
  const normalizedPreviewFeatures = normalizePreviewFeatures(
    prismaClientProvider.previewFeatures,
    prismaVersion,
    datasourceProvider,
  );

  const prismaClientDmmf = await getDMMF({
    datamodel: options.datamodel,
    previewFeatures: normalizedPreviewFeatures,
  });

  const generatorConfig = options.generator.config;
  // TODO: make this type `?-` and `| undefined`
  const externalConfig: ExternalGeneratorOptions = {
    emitDMMF: parseStringBoolean(generatorConfig.emitDMMF),
    emitTranspiledCode: parseStringBoolean(generatorConfig.emitTranspiledCode),
    simpleResolvers: parseStringBoolean(generatorConfig.simpleResolvers),
    useOriginalMapping: parseStringBoolean(generatorConfig.useOriginalMapping),
    useUncheckedScalarInputs: parseStringBoolean(
      generatorConfig.useUncheckedScalarInputs,
    ),
    emitIdAsIDType: parseStringBoolean(generatorConfig.emitIdAsIDType),
    emitOnly: parseStringArray(
      generatorConfig.emitOnly,
      "emitOnly",
      ALL_EMIT_BLOCK_KINDS,
    ),
    useSimpleInputs: parseStringBoolean(generatorConfig.useSimpleInputs),
    emitRedundantTypesInfo: parseStringBoolean(
      generatorConfig.emitRedundantTypesInfo,
    ),
    customPrismaImportPath: parseString(
      generatorConfig.customPrismaImportPath,
      "customPrismaImportPath",
    ),
    contextPrismaKey: parseString(
      generatorConfig.contextPrismaKey,
      "contextPrismaKey",
    ),
    omitInputFieldsByDefault: parseStringArray(
      generatorConfig.omitInputFieldsByDefault,
      "omitInputFieldsByDefault",
    ),
    omitOutputFieldsByDefault: parseStringArray(
      generatorConfig.omitOutputFieldsByDefault,
      "omitOutputFieldsByDefault",
    ),
    formatGeneratedCode:
      parseStringBoolean(generatorConfig.formatGeneratedCode) ??
      parseStringEnum(
        generatorConfig.formatGeneratedCode,
        "formatGeneratedCode",
        ["prettier", "tsc"] as const,
      ),
    emitIsAbstract: parseStringBoolean(generatorConfig.emitIsAbstract) ?? false,
  };
  const internalConfig: InternalGeneratorOptions = {
    outputDirPath: outputDir,
    prismaClientPath,
  };

  if (externalConfig.emitDMMF) {
    await Promise.all([
      asyncFs.writeFile(
        path.resolve(outputDir, "./dmmf.json"),
        JSON.stringify(options.dmmf, null, 2),
      ),
      asyncFs.writeFile(
        path.resolve(outputDir, "./prisma-client-dmmf.json"),
        JSON.stringify(prismaClientDmmf, null, 2),
      ),
    ]);
  }

  // TODO: replace with `options.dmmf` when the spec match prisma client output
  await generateCode(prismaClientDmmf, {
    ...externalConfig,
    ...internalConfig,
  });
  return "";
}

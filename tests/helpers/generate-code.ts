import path from "path";
import generateCode from "../../src/generator/generate-code";
import {
  ExternalGeneratorOptions,
  InternalGeneratorOptions,
} from "../../src/generator/options";
import getPrismaClientDmmfFromPrismaSchema from "./dmmf";

type SupportedPreviewFeatures = "fullTextSearch";

interface GenerateCodeFromSchemaOptions
  extends Omit<
    ExternalGeneratorOptions & InternalGeneratorOptions,
    "prismaClientPath"
  > {
  previewFeatures?: SupportedPreviewFeatures[];
  prismaClientPath?: string;
  prismaVersion?: string;
}

export async function generateCodeFromSchema(
  schema: string,
  options: GenerateCodeFromSchemaOptions,
  provider?: string,
): Promise<void> {
  await generateCode(
    await getPrismaClientDmmfFromPrismaSchema(
      schema,
      options.previewFeatures,
      provider,
      options.prismaVersion,
    ),
    {
      prismaClientPath: path.resolve(__dirname, "./prisma-client-mock"),
      ...options,
    },
  );
}

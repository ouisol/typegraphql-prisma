import { normalizePreviewFeatures } from "../../src/utils/preview-features";

describe("normalizePreviewFeatures", () => {
  describe("Prisma 5 compatibility", () => {
    it("should not transform fullTextSearch with Prisma 5 and PostgreSQL", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "5.18.0",
        "postgresql",
      );
      expect(result).toEqual(["fullTextSearch"]);
    });

    it("should not transform fullTextSearch with Prisma 5 and MySQL", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "5.18.0",
        "mysql",
      );
      expect(result).toEqual(["fullTextSearch"]);
    });

    it("should handle multiple preview features with Prisma 5", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch", "orderByNulls", "extendedWhereUnique"],
        "5.18.0",
        "postgresql",
      );
      expect(result).toEqual([
        "fullTextSearch",
        "orderByNulls",
        "extendedWhereUnique",
      ]);
    });

    it("should handle empty array with Prisma 5", () => {
      const result = normalizePreviewFeatures([], "5.18.0", "postgresql");
      expect(result).toEqual([]);
    });
  });

  describe("Prisma 6+ PostgreSQL", () => {
    it("should transform fullTextSearch to fullTextSearchPostgres with Prisma 6 and PostgreSQL", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.0.0",
        "postgresql",
      );
      expect(result).toEqual(["fullTextSearchPostgres"]);
    });

    it("should transform fullTextSearch with 'postgres' connector type", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.0.0",
        "postgres",
      );
      expect(result).toEqual(["fullTextSearchPostgres"]);
    });

    it("should not transform if already using fullTextSearchPostgres", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearchPostgres"],
        "6.0.0",
        "postgresql",
      );
      expect(result).toEqual(["fullTextSearchPostgres"]);
    });

    it("should handle multiple features and only transform fullTextSearch", () => {
      const result = normalizePreviewFeatures(
        ["orderByNulls", "fullTextSearch", "extendedWhereUnique"],
        "6.0.0",
        "postgresql",
      );
      expect(result).toEqual([
        "orderByNulls",
        "fullTextSearchPostgres",
        "extendedWhereUnique",
      ]);
    });

    it("should work with Prisma 6.19", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.19.0",
        "postgresql",
      );
      expect(result).toEqual(["fullTextSearchPostgres"]);
    });

    it("should work with Prisma versions higher than 6", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "7.0.0",
        "postgresql",
      );
      expect(result).toEqual(["fullTextSearchPostgres"]);
    });

    it("should work with pre-release versions", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.0.0-beta.1",
        "postgresql",
      );
      expect(result).toEqual(["fullTextSearchPostgres"]);
    });
  });

  describe("Prisma 6+ MySQL", () => {
    it("should NOT transform fullTextSearch with Prisma 6 and MySQL", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.0.0",
        "mysql",
      );
      expect(result).toEqual(["fullTextSearch"]);
    });

    it("should handle multiple features without transformation for MySQL", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch", "orderByNulls"],
        "6.0.0",
        "mysql",
      );
      expect(result).toEqual(["fullTextSearch", "orderByNulls"]);
    });
  });

  describe("Other database providers", () => {
    it("should not transform for SQLite", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.0.0",
        "sqlite",
      );
      expect(result).toEqual(["fullTextSearch"]);
    });

    it("should not transform for MongoDB", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.0.0",
        "mongodb",
      );
      expect(result).toEqual(["fullTextSearch"]);
    });

    it("should not transform for SQL Server", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.0.0",
        "sqlserver",
      );
      expect(result).toEqual(["fullTextSearch"]);
    });

    it("should not transform for CockroachDB", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "6.0.0",
        "cockroachdb",
      );
      expect(result).toEqual(["fullTextSearch"]);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty preview features array", () => {
      const result = normalizePreviewFeatures([], "6.0.0", "postgresql");
      expect(result).toEqual([]);
    });

    it("should handle invalid version gracefully", () => {
      const result = normalizePreviewFeatures(
        ["fullTextSearch"],
        "invalid-version",
        "postgresql",
      );
      // Should return original array when version parsing fails
      expect(result).toEqual(["fullTextSearch"]);
    });

    it("should not mutate original array", () => {
      const original = ["fullTextSearch", "orderByNulls"];
      const result = normalizePreviewFeatures(original, "6.0.0", "postgresql");

      expect(original).toEqual(["fullTextSearch", "orderByNulls"]);
      expect(result).toEqual(["fullTextSearchPostgres", "orderByNulls"]);
      expect(result).not.toBe(original);
    });

    it("should handle other preview features without modification", () => {
      const result = normalizePreviewFeatures(
        ["driverAdapters", "relationJoins"],
        "6.0.0",
        "postgresql",
      );
      expect(result).toEqual(["driverAdapters", "relationJoins"]);
    });
  });
});

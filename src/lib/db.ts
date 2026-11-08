import "dotenv/config";
import path from "path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  let fileUrl: string;

  if (rawUrl && rawUrl.startsWith("libsql:")) {
    fileUrl = rawUrl;
  } else if (rawUrl && rawUrl.startsWith("file:")) {
    const filePath = rawUrl.replace(/^file:/, "");
    fileUrl = `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePath).replace(/\\/g, "/")}`;
  } else {
    fileUrl = `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), "dev.db").replace(/\\/g, "/")}`;
  }

  const adapter = new PrismaLibSql({
    url: fileUrl,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

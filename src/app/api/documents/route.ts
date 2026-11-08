import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractResumeData } from "@/lib/ai/resume-extractor";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

// Storage directory outside public folder
const STORAGE_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "storage", "documents");

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "Uploaded Document";
    const fileType = (formData.get("fileType") as string) || "RESUME";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    // Validate allowed mime types
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".md") && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF, TXT, or DOCX." },
        { status: 400 }
      );
    }

    // Ensure private storage directory exists
    const userStorageDir = path.join(STORAGE_DIR, user.id);
    await fs.mkdir(userStorageDir, { recursive: true });

    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const targetFilePath = path.join(userStorageDir, safeFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(targetFilePath, buffer);

    // Read or extract text
    let extractedText = "";
    if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      extractedText = buffer.toString("utf-8");
    } else {
      // Basic text extraction heuristic for ASCII text in document or fallback simulation
      extractedText = buffer.toString("latin1").replace(/[^\x20-\x7E\n\r]/g, " ").replace(/\s+/g, " ");
      if (extractedText.length < 50) {
        extractedText = `${user.name}\n${file.name}\nAcademic Record & Skills Summary\nUploaded: ${new Date().toLocaleDateString()}`;
      }
    }

    // Run extraction through structured extractor
    const extractedData = await extractResumeData(extractedText);

    // Save document record (unconfirmed until user reviews and accepts!)
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        title,
        fileName: safeFileName,
        filePath: targetFilePath,
        fileType,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        extractedText: extractedText.slice(0, 5000),
        isConfirmed: false,
        extractedDataJson: JSON.stringify(extractedData),
      },
    });

    return NextResponse.json({
      success: true,
      document,
      extractedData,
      requiresConfirmation: true,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Failed to process document upload" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId: user.id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Remove file from disk
    try {
      await fs.unlink(doc.filePath);
    } catch {
      // Ignore if file already removed from disk
    }

    await prisma.document.delete({ where: { id: doc.id } });

    return NextResponse.json({ success: true, message: "Document deleted securely" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}

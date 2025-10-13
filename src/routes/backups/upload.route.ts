import { Elysia } from "elysia";
import fs from "fs";
import { writeFile, mkdir, stat, readFile } from "fs/promises";
import path from "path";
import { lookup as mimeLookup } from "mime-types";
import {Buffer} from 'buffer'



const UPLOAD_DIR = path.join(process.cwd(), "uploads");
await mkdir(UPLOAD_DIR, { recursive: true });

// route minimalis
export const uploadRoute = new Elysia({ prefix: "/upload" })



    .post("/", async (ctx: any) => {
        const body = ctx.body as Record<string, any>;

        let file = body?.file ?? body?.image ?? undefined;
        if (!file) {
            for (const k of Object.keys(body || {})) {
                const v = body[k];
                if (v && typeof v === "object" && typeof v.arrayBuffer === "function") {
                    file = v;
                    break;
                }
            }
        }

        const { filename: fFilename, name: fName, type: fType } = file;
        const extFromMime = require("mime-types").extension(fType) || "bin";
        const baseName = fFilename ?? fName ?? `upload.${extFromMime}`;
        const safeName = `${Date.now()}-${String(baseName).replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;

        const filePath = path.join(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"), safeName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        return { status: 201, body: { success: true, message: "Upload berhasil", filename: safeName, url: `/upload/files/${encodeURIComponent(safeName)}` } };
    })

    .get("/files/:filename", async ({ params, set }) => {
        const filename = params.filename;
        const filePath = path.join(UPLOAD_DIR, filename);

        try {
            const fileStat = await stat(filePath);
            if (!fileStat.isFile()) throw new Error("not file");

            const mimeType = mimeLookup(filePath) || "application/octet-stream";
            const fileBuffer = await fs.promises.readFile(filePath);
            const uint8Array = new Uint8Array(fileBuffer);

            return new Response(uint8Array, {
                headers: { "Content-Type": mimeType },
            });
        } catch {
            set.status = 404;
            return new Response("NOT_FOUND", { status: 404 });
        }
    });

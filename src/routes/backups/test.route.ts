import { Elysia } from "elysia";

export const testRoute = new Elysia({ prefix: "/test" })
    // 🔸 1. Plain text
    .get("/text", () => {
        const data = "<h1 style='color:blue'>santaikawan</h1>";
        const blob = new Blob([data], { type: "text/html" });
        return new Response(blob, { headers: { "Content-Type": blob.type } });
    })

    // 🔸 2. HTML
    .get("/html", () => {
        const data = "<h1 style='color:red'>Halo Dunia (HTML)</h1>";
        const blob = new Blob([data], { type: "text/html" });
        return new Response(blob, { headers: { "Content-Type": blob.type } });
    })

    // 🔸 3. JSON
    .get("/json", () => {
        const data = JSON.stringify({ message: "Halo Dunia (JSON)" });
        const blob = new Blob([data], { type: "application/json" });
        return new Response(blob, { headers: { "Content-Type": blob.type } });
    })

   .get("/download", async () => {
       const data = "Ini file download.txt\nHalo Dunia!";
       const blob = new Blob([data], { type: "application/octet-stream" });

       const buffer = await blob.arrayBuffer(); // ✅ aman & clean

       return new Response(buffer, {
           headers: {
               "Content-Type": "application/octet-stream",
               "Content-Disposition": 'attachment; filename="download.mp4"',
            //    "Content-Length": buffer.byteLength.toString()
           }
       });
   })
    .get("/blob", async ({ query }) => {
        const type = query.type || "text/plain";
        const content = query.text || "Halo Dunia!";

        const blob = new Blob([content], { type });
        const buffer = await blob.arrayBuffer();
        const bytes = Array.from(new Uint8Array(buffer));

        return {
            type: blob.type,
            size: blob.size,
            bytes,
            text: new TextDecoder().decode(buffer)
        };
    });

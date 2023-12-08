import { checkEmail } from "./lib.ts";

const PORT =
    (Deno.env.get("PORT") ? parseInt(Deno.env.get("PORT") || "") : null) || 8080

const HEADER = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
}

Deno.serve({ port: PORT }, async (request) => {
    const url = new URL(request.url)

    switch (url.pathname) {
        case "/": {
            return new Response("Hello world!", { status: 200 })
        }
        case "/check_email": {
            switch (request.method) {
                case "POST": {
                    const { content, status } = await checkEmail(await request.text())
                    return new Response(JSON.stringify(content), { status, headers: HEADER })
                }
                default: {
                    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
                }
            }
        }
        default: {
            return new Response(JSON.stringify({ error: "Resource not found" }), { status: 404 })
        }
    }
})
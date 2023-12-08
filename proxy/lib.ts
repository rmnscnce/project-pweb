import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

export const checkEmail = async (body: string): Promise<{ content: object, status: number }> => {
    const client = createClient(Deno.env.get("SUPABASE_PROJECT_URL") || "", Deno.env.get("SUPABASE_KEY") || "", {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    const adminClient = client.auth.admin

    const { data: { users }, error } = await adminClient.listUsers()

    if (error) {
        console.error(error)
        return { content: { error: "Internal server error" }, status: 500 }
    }

    const email = JSON.parse(body)["email"]
    const user = users.find((user) => user.email === email)

    if (!user) {
        return { content: { exists: false }, status: 200 }
    } else {
        return { content: { exists: true }, status: 200 }
    }
}
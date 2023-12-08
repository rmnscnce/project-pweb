'use client';

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "./components/navbar";

export default function Home() {
  const session = useSession();
  const supabaseClient = useSupabaseClient();

  return (
    <div>
      <Navbar session={session} />

      <main className="flex min-h-screen flex-col items-center justify-between p-24"></main>
    </div>
  );
}

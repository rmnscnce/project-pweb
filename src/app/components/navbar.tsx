"use client";

import { Database } from "@/lib/schema";
import { Session, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import AuthFlowModal from "./modals/auth-flow";

function ProfileButton({ session }: { session: Session | null }) {
  return session ? (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar tooltip tooltip-bottom"
        data-tip={session.user?.id}
      >
        <div className="w-10 rounded-full mx-auto my-auto">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://yt3.ggpht.com/a/default-user"
          />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
      >
        <li>
          <a>Settings</a>
        </li>
        <li>
          <a>Logout</a>
        </li>
      </ul>
    </div>
  ) : (
    <div>
      <button
        className="btn btn-accent"
        onClick={() => {
          return (
            document.getElementById("login-modal") as HTMLDialogElement
          )?.showModal();
        }}
      >
        Sign in
      </button>

      <AuthFlowModal id="login-modal" bouncer={false} />
    </div>
  );
}

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <div className="fixed top-0 navbar bg-base-100">
      <div className="flex-1">
        <span className="text-xl pl-2 font-extrabold">Sticky Square</span>
      </div>
      <div className="flex-none gap-2">
        <div className="form-control hidden">
          {/* Hidden because we don't have it working yet */}
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-24 md:w-auto"
          />
        </div>
        <ProfileButton session={session} />
      </div>
    </div>
  );
}

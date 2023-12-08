"use client";

import { PROXY_BASEURL } from "@/lib/schema";
import { MouseEventHandler } from "react";

const HandleEmailContinue: MouseEventHandler = async (e) => {
  e.preventDefault();
  const body = {
    email: (document.getElementById("auth-email") as HTMLInputElement).value,
  };
  const { exists } = (await (
    await fetch(
      new Request(`${PROXY_BASEURL}/check_email`, {
        method: "POST",
        body: JSON.stringify(body),
      })
    )
  ).json()) as { exists: boolean };
};

function CombinedForm({ registered }: { registered: boolean }) {
  return registered ? (
    <form className="flex flex-col justify-center mx-auto my-auto"></form>
  ) : (
    <form className="flex flex-col justify-center mx-auto my-auto"></form>
  );
}

export default function AuthFlowModal({
  id,
  bouncer,
}: {
  id: string;
  bouncer: boolean;
}) {
  return (
    <dialog id={id} className="modal modal-bottom sm:modal-middle">
      <div
        className="modal-box flex justify-center w-[100%] sm:w-[100%] sm:max-w-[360px]"
        id="authflow-modal"
      >
        <form className="flex flex-col justify-center mx-auto my-auto">
          <div>
            <h3 className="text-lg font-semibold">Welcome!</h3>
            {bouncer && (
              <p className="text-sm text-gray-500 font-semibold pb-3">
                You must be signed in to use this feature.
              </p>
            )}

            <p className="text-sm text-gray-500">
              Enter your email address to get started.
            </p>
          </div>
          <div className="join join-vertical pt-4">
            <input
              type="text"
              id="auth-email"
              placeholder="Email address"
              className="input input-bordered join-item w-full max-w-xs"
            />
          </div>
          <div className="mx-auto pt-5">
            <input
              type="button"
              id="auth-continue"
              value="Continue"
              onClick={HandleEmailContinue}
              className="btn btn-neutral w-[10rem] rounded-full"
            />
          </div>
        </form>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

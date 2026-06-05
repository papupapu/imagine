"use client";

import { Button } from "@papupapu/ui";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-gray-light bg-white p-8 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-gray-dark">Sign in</h1>
        <p className="mt-1 text-sm text-gray-mid">
          Continue with your GitHub or Google account.
        </p>
      </div>
      <div className="space-y-3">
        <Button
          variant="secondary"
          className="w-full"
          action={() => authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" })}
        >
          Continue with GitHub
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          action={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

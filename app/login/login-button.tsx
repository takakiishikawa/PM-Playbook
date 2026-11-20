"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginButton({ signedIn }: { signedIn: boolean }) {
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    const supabase = createClient();
    if (signedIn) await supabase.auth.signOut();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
    });
  };

  return (
    <button type="button" className="btn-subtle h-btn" onClick={signIn} disabled={busy}>
      {busy ? "移動しています…" : signedIn ? "別のアカウントでログイン" : "Googleでログイン"}
    </button>
  );
}

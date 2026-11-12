import type { Metadata } from "next";
import { AccountView } from "@/components/account-view";
import { RequireAuth } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Tài khoản của tôi", robots: { index: false } };

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountView />
    </RequireAuth>
  );
}

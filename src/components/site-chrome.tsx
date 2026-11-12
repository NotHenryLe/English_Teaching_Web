"use client";

import { LogOut, Menu, Shield, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth, useContact } from "./providers";
import { cx, safeUrl } from "./ui";

function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight" aria-label={`${name} — trang chủ`}>
      <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-base text-white shadow-[0_3px_0_var(--color-brand-800)]">
        Aa
      </span>
      <span className="text-lg leading-none">{name}</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { ready, user, profile, signOut } = useAuth();
  const contact = useContact();
  const [open, setOpen] = useState(false);
  const brand = contact.org_name || SITE_NAME;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đóng menu di động khi chuyển trang
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const staff = profile?.role === "admin" || profile?.role === "teacher";
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Tài khoản";

  const accountLinks = user ? (
    <>
      {staff ? (
        <Link href={profile?.role === "admin" ? "/quan-tri" : "/giao-vien"} className="btn btn-ghost btn-sm">
          <Shield size={16} aria-hidden />
          {profile?.role === "admin" ? "Quản trị" : "Giáo viên"}
        </Link>
      ) : null}
      <Link href="/tai-khoan" className="btn btn-outline btn-sm max-w-44">
        <UserIcon size={16} aria-hidden />
        <span className="truncate">{displayName}</span>
      </Link>
      <button type="button" onClick={() => void signOut()} className="btn btn-ghost btn-sm" aria-label="Đăng xuất">
        <LogOut size={16} aria-hidden />
        <span className="lg:hidden">Đăng xuất</span>
      </button>
    </>
  ) : (
    <>
      <Link href="/dang-nhap" className="btn btn-ghost btn-sm">
        Đăng nhập
      </Link>
      <Link href="/dang-ky" className="btn btn-primary btn-sm">
        Đăng ký miễn phí
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-line bg-paper/95 backdrop-blur">
      <a href="#noi-dung" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Bỏ qua, tới nội dung chính
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo name={brand} />
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cx(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive(link.href) ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-ink/5",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-1.5 lg:flex" aria-busy={!ready}>
          {isSupabaseConfigured ? (ready ? accountLinks : <span className="h-9 w-40 animate-pulse rounded-lg bg-line/60" />) : null}
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm lg:hidden"
          aria-expanded={open}
          aria-controls="menu-di-dong"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          Menu
        </button>
      </div>
      {open ? (
        <div id="menu-di-dong" className="border-t-[1.5px] border-line bg-paper lg:hidden">
          <nav aria-label="Điều hướng chính (di động)" className="container-page grid gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cx(
                  "rounded-lg px-3 py-3 text-base font-semibold",
                  isActive(link.href) ? "bg-brand-50 text-brand-700" : "hover:bg-ink/5",
                )}
              >
                {link.label}
              </Link>
            ))}
            {isSupabaseConfigured && ready ? <div className="mt-2 flex flex-wrap gap-2 border-t border-line pt-3">{accountLinks}</div> : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  const contact = useContact();
  const brand = contact.org_name || SITE_NAME;
  const facebook = safeUrl(contact.facebook);
  return (
    <footer className="mt-20 border-t-[1.5px] border-line bg-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-lg font-extrabold">{brand}</p>
          <p className="mt-2 max-w-md text-sm text-muted">{contact.about || SITE_TAGLINE}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Học miễn phí</p>
          <ul className="mt-3 grid gap-2 text-sm">
            {NAV_LINKS.slice(0, 4).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-700 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Liên hệ</p>
          <ul className="mt-3 grid gap-2 text-sm">
            {contact.phone ? (
              <li>
                Điện thoại:{" "}
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="font-medium hover:underline">
                  {contact.phone}
                </a>
              </li>
            ) : null}
            {contact.email ? (
              <li>
                Email:{" "}
                <a href={`mailto:${contact.email}`} className="font-medium hover:underline">
                  {contact.email}
                </a>
              </li>
            ) : null}
            {contact.address ? <li>{contact.address}</li> : null}
            {facebook ? (
              <li>
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                  Facebook
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/lien-he" className="hover:text-brand-700 hover:underline">
                Trang liên hệ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-4 text-xs text-muted">
          © {new Date().getFullYear()} {brand}. Nội dung học miễn phí cho mọi người.
        </p>
      </div>
    </footer>
  );
}

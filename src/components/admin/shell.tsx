"use client";

import Link from "next/link";
import { RequireAuth } from "../auth-forms";
import { useAuth } from "../providers";
import { cx } from "../ui";

const LINKS: { href: string; label: string; adminOnly?: boolean; teacherOnly?: boolean; group: string }[] = [
  { href: "/quan-tri", label: "Tổng quan", adminOnly: true, group: "Vận hành" },
  { href: "/giao-vien", label: "Lớp tôi dạy", group: "Vận hành" },
  { href: "/quan-tri/dang-ky", label: "Đăng ký Callan", adminOnly: true, group: "Vận hành" },
  { href: "/quan-tri/lop-hoc", label: "Lớp & lịch học", adminOnly: true, group: "Vận hành" },
  { href: "/quan-tri/goi-hoc", label: "Gói học", adminOnly: true, group: "Vận hành" },
  { href: "/quan-tri/ket-qua", label: "Kết quả học viên", group: "Vận hành" },
  { href: "/quan-tri/tu-vung", label: "Từ vựng", group: "Nội dung" },
  { href: "/quan-tri/ngu-phap", label: "Ngữ pháp", group: "Nội dung" },
  { href: "/quan-tri/ielts", label: "Đề IELTS", group: "Nội dung" },
  { href: "/quan-tri/nguoi-dung", label: "Người dùng", adminOnly: true, group: "Hệ thống" },
  { href: "/quan-tri/cai-dat", label: "Cài đặt", adminOnly: true, group: "Hệ thống" },
];

/** Khung chung cho khu vực giáo viên / quản trị: kiểm tra quyền + thanh điều hướng. */
export function StaffShell({ need, active, title, children }: { need: "staff" | "admin"; active: string; title: string; children: React.ReactNode }) {
  return (
    <RequireAuth need={need}>
      <div className="container-page py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)]">
          <StaffNav active={active} />
          <div className="min-w-0">
            <h1 className="mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

function StaffNav({ active }: { active: string }) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const links = LINKS.filter((link) => !link.adminOnly || isAdmin);
  const groups = [...new Set(links.map((link) => link.group))];
  return (
    <nav aria-label="Khu vực quản trị" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      <div className="flex gap-1.5 overflow-x-auto pb-2 lg:block lg:overflow-visible lg:pb-0">
        {groups.map((group) => (
          <div key={group} className="contents lg:mb-4 lg:block">
            <p className="hidden px-3 pb-1 text-xs font-bold uppercase tracking-wider text-muted lg:block">{group}</p>
            {links
              .filter((link) => link.group === group)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active === link.href ? "page" : undefined}
                  className={cx(
                    "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap lg:block",
                    active === link.href ? "bg-ink text-white" : "bg-white text-ink hover:bg-brand-50 lg:bg-transparent",
                  )}
                >
                  {link.label}
                </Link>
              ))}
          </div>
        ))}
      </div>
    </nav>
  );
}

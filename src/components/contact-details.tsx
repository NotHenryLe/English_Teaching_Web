"use client";

import { Clock, Mail, MapPin, MessageCircle, Phone, ThumbsUp } from "lucide-react";
import { useContact } from "./providers";
import { EmptyState, safeUrl } from "./ui";

export function ContactDetails() {
  const contact = useContact();
  const facebook = safeUrl(contact.facebook);
  const zaloLink = safeUrl(contact.zalo) ?? (/^[0-9+\s.]{8,15}$/.test(contact.zalo) ? `https://zalo.me/${contact.zalo.replace(/\D/g, "")}` : null);

  const rows = [
    contact.address && { icon: MapPin, label: "Địa chỉ", value: contact.address, href: null },
    contact.phone && { icon: Phone, label: "Điện thoại", value: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    contact.email && { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.zalo && { icon: MessageCircle, label: "Zalo", value: contact.zalo, href: zaloLink },
    facebook && { icon: ThumbsUp, label: "Facebook", value: facebook.replace(/^https?:\/\/(www\.)?/, ""), href: facebook },
    contact.working_hours && { icon: Clock, label: "Giờ làm việc", value: contact.working_hours, href: null },
  ].filter((row): row is { icon: typeof MapPin; label: string; value: string; href: string | null } => Boolean(row));

  if (!rows.length) {
    return <EmptyState title="Thông tin liên hệ đang được cập nhật">Bạn vui lòng quay lại sau.</EmptyState>;
  }

  return (
    <div className="card p-5 sm:p-6">
      {contact.org_name ? <p className="text-xl font-bold">{contact.org_name}</p> : null}
      {contact.about ? <p className="mt-1 text-muted">{contact.about}</p> : null}
      <dl className="mt-4 grid gap-4">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <row.icon size={20} aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-sm font-semibold text-muted">{row.label}</dt>
              <dd className="font-medium break-words">
                {row.href ? (
                  <a href={row.href} className="text-brand-700 hover:underline" {...(row.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

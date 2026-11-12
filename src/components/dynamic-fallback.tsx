"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { IeltsRunner } from "./ielts-runner";
import { TenseLessonView } from "./tense-views";
import { VocabTopicView } from "./vocab-views";

const subscribe = () => () => {};
const SLUG = "([a-z0-9]+(?:-[a-z0-9]+)*)";

/**
 * Trang 404 kiêm "cửa dự phòng" cho nội dung mới.
 *
 * Web được xuất tĩnh nên mỗi chủ đề / bài học / đề thi chỉ có file HTML riêng sau một lần build.
 * Bài admin vừa thêm chưa có file → máy chủ trả trang 404 này; nếu đường dẫn có dạng của một
 * trang nội dung thì ta nạp bài đó trực tiếp từ Supabase, để người học vẫn xem được ngay.
 */
export function DynamicFallback() {
  const pathname = useSyncExternalStore(
    subscribe,
    () => window.location.pathname.replace(/\/+$/, ""),
    () => null,
  );

  if (pathname && isSupabaseConfigured) {
    const vocab = pathname.match(new RegExp(`^/tu-vung/${SLUG}$`));
    if (vocab) {
      return (
        <div className="container-page py-10">
          <VocabTopicView slug={vocab[1]} initial={null} />
        </div>
      );
    }
    const tense = pathname.match(new RegExp(`^/ngu-phap/${SLUG}$`));
    if (tense) {
      return (
        <div className="container-page py-10">
          <TenseLessonView slug={tense[1]} initial={null} siblings={[]} />
        </div>
      );
    }
    const ielts = pathname.match(new RegExp(`^/ielts/${SLUG}$`));
    if (ielts) return <IeltsRunner slug={ielts[1]} initial={null} demoKey={null} />;
  }

  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-7xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Không tìm thấy trang này</h1>
      <p className="mt-2 max-w-md text-muted">Đường dẫn có thể đã đổi hoặc bài học đã được gỡ. Bạn thử quay về trang chủ hoặc chọn một mục học bên dưới nhé.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Về trang chủ
        </Link>
        <Link href="/tu-vung" className="btn btn-outline">
          Từ vựng
        </Link>
        <Link href="/ngu-phap" className="btn btn-outline">
          Ngữ pháp
        </Link>
        <Link href="/ielts" className="btn btn-outline">
          IELTS
        </Link>
      </div>
    </div>
  );
}

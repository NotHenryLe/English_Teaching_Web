import type { MetadataRoute } from "next";
import { getIeltsTests, getTenses, getVocabTopics } from "@/lib/content-source";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [topics, tenses, tests] = await Promise.all([getVocabTopics(), getTenses(), getIeltsTests()]);
  const paths = [
    "",
    "/tu-vung",
    "/ngu-phap",
    "/ielts",
    "/phat-am",
    "/callan",
    "/lien-he",
    ...topics.map((topic) => `/tu-vung/${topic.slug}`),
    ...tenses.map((tense) => `/ngu-phap/${tense.slug}`),
    ...tests.map((test) => `/ielts/${test.slug}`),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : path.split("/").length > 2 ? 0.6 : 0.8 }));
}

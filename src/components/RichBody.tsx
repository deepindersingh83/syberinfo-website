import { RichText } from "@payloadcms/richtext-lexical/react";
import type { ComponentProps } from "react";

/**
 * Renders CMS Lexical rich text (headings, lists, links, inline images) with the
 * site's typographic styling. Used by the blog when an article has a richBody;
 * pages fall back to plain-text paragraphs otherwise.
 */
type RichData = ComponentProps<typeof RichText>["data"];

export default function RichBody({ data }: { data: unknown }) {
  return (
    <div className="rich-body">
      <RichText data={data as RichData} />
    </div>
  );
}

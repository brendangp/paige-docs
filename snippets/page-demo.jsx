/*
 * PageDemo — a silent, autoplay/looping walkthrough clip framed for the top of a
 * docs page. Clips are produced by the Paige capture kit (paige repo,
 * apps/web/tests/content) and published here to assets/videos/ by the
 * /sync-demo-videos skill. Wording lives in `caption` (and the page prose), not
 * burned into the video.
 *
 * Usage:
 *   import { PageDemo } from "/snippets/page-demo.jsx"
 *   <PageDemo src="/assets/videos/connect-whatsapp.mp4"
 *             poster="/assets/videos/connect-whatsapp.poster.jpg"
 *             caption="Connect your own WhatsApp number" />
 *
 * <Frame> already adds loop/muted/playsInline to an autoPlay video; they're set
 * explicitly here too as a safeguard. Styling is Tailwind-only (no `style` prop)
 * to avoid layout shift.
 */
export const PageDemo = ({ src, poster, caption }) => (
  <Frame caption={caption}>
    <video
      autoPlay
      loop
      muted
      playsInline
      poster={poster}
      preload="metadata"
      className="w-full aspect-video rounded-xl"
      src={src}
    />
  </Frame>
);

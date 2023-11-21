/* Why optimize fonts? (Chapter 3)
https://nextjs.org/learn/dashboard-app/optimizing-fonts-images

* Fonts play a significant role in the design of a website, but using custom fonts
* can affect performance if font files need to be fetched & loaded.

Cumulative Layout Shift (CLS) is a metric used by Google to evaluate performance
and user experience of a website. With fonts, layout shift happens when browsers
initially renders text in a fallback or system font and then swaps it out for a
custom font once it has loaded. This swap can cause the text size, spacing, or
layout to change, shifting elements around it.

Mock UI showing initial load of a page, followed by a layout shift as the custom
font loads. Next.js automatically optimizes fonts in the application when you
use the next/font module. It downloads font files at build time and hosts them
with your other static assets. This means when a user visits your application,
there are no additional network requests for fonts which impacts performance.

By adding Inter to the <body> element, the font will be applied throughout your
application. Here, you're also adding the Tailwind `antialiased` which smooths
out the font. It's not necessary to use this class, but it adds a nice touch. */
import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}

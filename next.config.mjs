import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // Next.js 14 يضمّن دائمًا في حزمة العميل polyfills لميزات (Array.at, flat, flatMap,
      // Object.fromEntries, Object.hasOwn, trimStart/trimEnd) مهما كان browserslist.
      // كل المتصفحات المستهدفة في package.json (Chrome/Edge ≥ 93، Firefox ≥ 92،
      // Safari/iOS ≥ 15.4) تدعمها أصلًا، فهي ~12 ك.ب هدر على كل صفحة
      // (PageSpeed: «ميزات JavaScript القديمة»). نستبدل الملف ببديل فارغ.
      // لو وُسّع browserslist لمتصفحات أقدم من ذلك، احذف هذا الاستبدال.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /build[\\/]polyfills[\\/]polyfill-module(\.js)?$/,
          fileURLToPath(new URL('./scripts/empty-polyfill.js', import.meta.url))
        )
      );
    }
    return config;
  },
};

export default nextConfig;

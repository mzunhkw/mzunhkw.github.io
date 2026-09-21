import type { Config } from 'tailwindcss';

// لوحة "كريمي وفستقي": خلفيات فاتحة + أخضر فستقي هادئ + رملي دافئ
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#3A3A34', // النص
        cream: '#FBF8F2', // خلفية الصفحة
        sand: '#EADFCB', // رملي دافئ للبانرات والشارات
        sage: {
          DEFAULT: '#5E7A5A', // الأزرار والروابط
          soft: '#9DB59A',
          mist: '#DCE6D9', // خلفيات الصور والبطاقات الخفيفة
        },
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

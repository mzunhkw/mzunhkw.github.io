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
          DEFAULT: '#587355', // الأزرار والروابط (أُغمق قليلًا من #5E7A5A: تباين النص ≥ 4.5 على الكريمي)
          soft: '#9DB59A',
          mist: '#DCE6D9', // خلفيات الصور والبطاقات الخفيفة
        },
      },
      fontFamily: {
        arabic: ['var(--font-arabic)', 'var(--font-latin)', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

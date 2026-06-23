const fs = require('fs');
const path = require('path');

const srcPath = 'c:/Users/DEDE-/Desktop/lale-perde-site-temp/style.css';
const destPath = 'c:/Users/DEDE-/Desktop/lale-perde-site/src/app/globals.css';

let css = fs.readFileSync(srcPath, 'utf8');

// Replace the Google Font import and variables at the top
const originalVariablesBlock = `:root {
  --color-primary: #1A2E40;     /* Lacivert */
  --color-secondary: #D4AF37;   /* Altın */
  --color-tertiary: #ECE9E4;    /* Kırık Beyaz */
  --color-neutral: #F9F7F2;     /* Sıcak Krem */
  --color-text-dark: #2C2C2C;
  --color-text-light: #F9F7F2;
  --color-white: #FFFFFF;
  
  --font-serif: 'Cormorant Garamond', serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  
  --transition-smooth: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-fast: all 0.3s ease;
}`;

const newVariablesBlock = `:root {
  --color-primary: #1A2E40;     /* Marka Lacivert */
  --color-secondary: #152B41;   /* Koyu Lacivert */
  --color-accent: #BD954B;      /* Altın */
  --color-background: #F9FBF7;  /* Kırık Beyaz */
  --color-text: #1A1A1A;        /* Koyu Gri/Siyah */
  
  --color-neutral: #F9FBF7;
  --color-card-bg: #FFFFFF;
  --color-white: #FFFFFF;
  --color-border: rgba(26, 46, 64, 0.08);
  --color-text-light: #F9FBF7;
  --color-text-dark: #1A1A1A;
  
  --font-serif: 'Cormorant Garamond', serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  
  --transition-smooth: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-fast: all 0.3s ease;
}

[data-theme="dark"] {
  --color-primary: #0C1A27;     /* Gece Laciverti */
  --color-secondary: #152B41;   /* Koyu Lacivert */
  --color-accent: #BD954B;      /* Altın */
  --color-background: #0A141D;  /* Derin Karanlık */
  --color-text: #F9FBF7;        /* Kırık Beyaz */
  
  --color-neutral: #0D1924;
  --color-card-bg: #152B41;
  --color-white: #FFFFFF;
  --color-border: rgba(189, 149, 75, 0.2);
  --color-text-light: #F9FBF7;
  --color-text-dark: #F9FBF7;
}`;

// Replace variables
css = css.replace(originalVariablesBlock, newVariablesBlock);

// Replace all instances of var(--color-secondary) with var(--color-accent) 
// since var(--color-secondary) was gold in the old css, but gold is now var(--color-accent)
css = css.replaceAll('var(--color-secondary)', 'var(--color-accent)');

// Fix image URLs relative to public root in Next.js (i.e. url('assets/...') to url('/assets/...'))
css = css.replaceAll("url('assets/", "url('/assets/");
css = css.replaceAll('url("assets/', 'url("/assets/');

// Write to destination
fs.writeFileSync(destPath, css, 'utf8');
console.log('Successfully generated globals.css from original style.css');

const fs = require('fs');

const cssPath = 'c:/Users/DEDE-/Desktop/lale-perde-site/src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

const bannerStyles = `

/* Announcement Banner & Fixed Shifting added by Antigravity */
.announcement-banner {
  background: var(--color-primary);
  color: var(--color-accent);
  text-align: center;
  padding: 0.6rem 2rem;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  position: relative;
  z-index: 101;
  border-bottom: 1px solid rgba(189, 149, 75, 0.2);
  font-family: var(--font-sans);
}

header.has-banner {
  top: 35px; /* height of banner to sit right below it when not scrolled */
}

header.scrolled.has-banner {
  top: 1.5rem; /* return to floating state top offset when scrolled */
}
`;

if (!css.includes('.announcement-banner')) {
  fs.writeFileSync(cssPath, css + bannerStyles, 'utf8');
  console.log('Appended announcement banner styles successfully.');
} else {
  console.log('Announcement banner styles already present.');
}

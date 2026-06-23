const fs = require('fs');

const cssPath = 'c:/Users/DEDE-/Desktop/lale-perde-site/src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

const additionalStyles = `

/* Header Search & Controls Styling added by Antigravity */
.header-right {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.header-search {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 0.4rem 1rem;
  transition: all 0.3s ease;
}

.header-search:focus-within {
  border-color: var(--color-accent);
  background: rgba(255, 255, 255, 0.15);
}

.header-search input {
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.8rem;
  width: 130px;
  font-family: var(--font-sans);
}

.header-search input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.header-search svg {
  width: 16px !important;
  height: 16px !important;
  color: var(--color-accent);
  cursor: pointer;
  display: block;
}

.theme-toggle-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  color: var(--color-accent);
}

.lang-switch-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  border-radius: 4px;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  text-transform: uppercase;
  font-family: var(--font-sans);
  transition: all 0.2s ease;
}

.lang-switch-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
`;

// Append styles if not already present
if (!css.includes('.header-search')) {
  fs.writeFileSync(cssPath, css + additionalStyles, 'utf8');
  console.log('Appended search and header control styles to globals.css');
} else {
  console.log('Styles already present in globals.css');
}

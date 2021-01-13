# ZHRN Portfolio 2020
Built in Svelte. 

Learned a lot about Svelte and GSAP.

Looking forward to Sveltekit :)

Live at http://www.zacme.ink

## Development server

Run `npm run dev` for a dev server. Defaults to `http://localhost:5000/`.

## CSS

SCSS within Svelte components is set up and enabled but not currently in use. Some global css is placed directly into public/global.css instead of doing it as prefixed css within Svelte components.

## Club Greensock

Some premium GSAP features are used (DrawSVG). A valid Club Greensock key is necessary to successfully build. Achieved locally via .npmrc, and set up at Netlify with an environment variable to keep the key out of the Github public repository. 

## Work and deploy

Work on develop branch with additional branches for major feature adds. Merge to staging to test on server. Netlify is setup to auto deploy staging at http://staging.zacme.ink

Once done with QA, merge onto master, and Netlify will deploy to http://www.zacme.ink
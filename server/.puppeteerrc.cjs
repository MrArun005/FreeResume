// Puppeteer config — pins the browser cache to a project-local path so the
// Chromium binary survives the build → runtime container handoff on Render.
//
// Why this exists:
//   By default Puppeteer downloads Chromium to ~/.cache/puppeteer (e.g.
//   /opt/render/.cache/puppeteer on Render). On Render, that path is NOT
//   persisted between the build phase and the runtime container — Chrome
//   downloads happily during `npm install`, then disappears at runtime,
//   producing the famous:
//
//     Could not find Chrome (ver. X). ... cache path is incorrectly
//     configured (which is: /opt/render/.cache/puppeteer).
//
//   The deployment artifact includes everything under the project
//   directory, so caching there guarantees both build and runtime see the
//   same path. Both `npm install` (postinstall) and `puppeteer.launch()`
//   read this file, so the install location and the launch lookup
//   automatically agree.
//
// Local dev: this writes Chrome into server/.cache/puppeteer/ which is
// gitignored. First `npm install` after pulling this change will redownload
// Chrome locally too — about 200MB, one-time.

const { join } = require('node:path');

module.exports = {
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

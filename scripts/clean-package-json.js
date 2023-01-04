const fs = require('fs')
const path = require('path')

// Define absolute paths for original pkg and temporary pkg.
const ORIG_PKG_PATH = path.resolve(__dirname, '../package.json')
const CACHED_PKG_PATH = path.resolve(__dirname, '../cached-package.json')

// Obtain original `package.json` contents.
const pkgData = require(ORIG_PKG_PATH)

// Write/cache the original `package.json` data to `cached-package.json` file.
fs.writeFile(CACHED_PKG_PATH, JSON.stringify(pkgData), function (err) {
  if (err) throw err
})

// Remove all scripts
// if (pkgData.scripts) delete pkgData.scripts


// Remove all dev dependencies
if (pkgData.devDependencies) delete pkgData.devDependencies


// Remove repository settings
if (pkgData.repository) delete pkgData.repository

// Remove committizen config
if (pkgData.config) delete pkgData.config

// Update main and types endpoints for dist folder
pkgData.main = './dist/Plerry.js'
pkgData.types = './dist/Plerry.d.ts'

// Overwrite original `package.json` with new data (i.e. minus the specific data).
fs.writeFile(ORIG_PKG_PATH, JSON.stringify(pkgData, null, 2), function (err) {
  if (err) throw err
})

require('dotenv').config()
const chokidar = require('chokidar');
const chalk = require('chalk')
const path = require("path");
const { copy, mkdirp, access, constants, readJson, writeJson, remove } = require("fs-extra");

const errorColor = chalk.bold.red;
const warningColor = chalk.keyword('orange');
const successColor = chalk.bold.green;
const infoColor = chalk.cyan;
const errorLog = (value) => console.error(errorColor(value))
const successLog = (value) => console.log(successColor(value))
const infoLog = (value) => console.log(infoColor(value))

let watcher;

const configJSON = require("../finsemble.config.json")
const SRC_FOLDER = "./src"
const FINSEMBLE_CONFIG = "finsemble.config.json"

const state = {
  importConfig: []
}

const seedProjectPath = process.env.SEED || configJSON.seedProjectDirectory
const seedDirectory = path.join(seedProjectPath)

access(seedDirectory, constants.F_OK | constants.W_OK, (err) => {
  if (err) {
    errorLog(
      `${seedDirectory} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
  } else {
    beginWatch(seedDirectory)
  }
});

function beginWatch(seedDirectory) {
  // Initialize watcher.
  watcher = chokidar.watch([SRC_FOLDER, FINSEMBLE_CONFIG, "package.json"], {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });
  // Add event listeners.
  watcher
    .on('add', path => updateSeed('add', path, `Added File: ${path}`, seedDirectory))
    .on('change', path => updateSeed('add', path, `Updated: ${path}`, seedDirectory))
    .on('unlink', path => updateSeed('add', path, `Removed: ${path}`, seedDirectory))
    .on('addDir', path => updateSeed('addDir', path, `Added Directory: ${path}`, seedDirectory))
    .on('unlinkDir', path => updateSeed('unlinkDir', path, `Removed Directory: ${path}`, seedDirectory))
    .on('error', error => errorLog(`Watcher error: ${error}`, seedDirectory))
    .on('ready', () => ready(seedDirectory))
}


function updateSeed(action, currentPath, message, seedDirectory) {
  const destDir = `${seedDirectory}`
  const destinationPath = path.join(destDir, currentPath)

  if (currentPath === FINSEMBLE_CONFIG) {
    try {
      updateConfig(seedDirectory, currentPath)
    } catch (error) {
      console.error(`could not update the config due to: ${error}`)
    }
    return
  }

  if (currentPath === "package.json") {
    updatePackageJSON(currentPath, seedDirectory)
    return
  }

  if (action === "addDir") {
    mkdirp(destinationPath)
  }

  if (action === "change" || action === "add") {
    copy(currentPath, destinationPath)
      .then(() => infoLog(message))
      .catch(err => errorLog(`could not change or add file or folder: ${err}`))
    return
  }

  if (action === "unlink" || action === "unlinkDir") {
    remove(destinationPath)
      .then(() => infoLog(message))
      .catch(err => errorLog(`could not remove file or folder: ${err}`))
    return
  }
}

function ready(seedDirectory) {
  // exit if only copy vs watch
  if (process.argv.includes("copy")) {
    watcher.close()
  }

  successLog(`
  ✔ Seed Project Folder Found at ${seedDirectory}
  ✔ src folder found

  ---Begin watching---
  Ready for changes`)
}


async function updateConfig(seedDirectory, currentFile) {
  const seedConfigPath = path.join(seedDirectory, 'configs/application/config.json')

  try {
    const projectConfig = await readJson(currentFile)
    const oldProjectImportConfigValues = state.importConfig;
    const deletedConfigValues = oldProjectImportConfigValues.filter(configValue => !projectConfig.importConfig.includes(configValue)
    )

    let seedConfig = await readJson(seedConfigPath)
    let newConfig = [...seedConfig.importConfig, ...projectConfig.importConfig]

    // remove old unused or deleted config values
    newConfig = newConfig.filter(configValue => !deletedConfigValues.includes(configValue))

    // only get unique values, no duplicates
    seedConfig.importConfig = Array.from(new Set(newConfig))

    await writeJson(seedConfigPath, seedConfig, { spaces: 2 })

    state.importConfig = projectConfig.importConfig;
    successLog(`
    📑 success updating config
    `)

  } catch (error) {
    errorLog(error)
  }

}

async function updatePackageJSON(currentFile, seedDirectory) {
  const seedPackageJSONPath = path.join(seedDirectory, 'package.json')

  try {

    // get the seed package.json file
    let seedPackageJSON = await readJson(seedPackageJSONPath)
    // get the current package.json file
    const projectPackageJSON = await readJson(currentFile)

    seedPackageJSON.dependencies = { ...seedPackageJSON.dependencies, ...projectPackageJSON.dependencies }


    await writeJson(seedPackageJSONPath, seedPackageJSON, { spaces: 2 })

    successLog(`
    ✔ success updating package.json
    `)

  } catch (error) {
    errorLog(error)
  }

}
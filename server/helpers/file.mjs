import fs from 'fs/promises';

const fileOpts = { 'encoding': 'utf-8' };

async function fileExists(path) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

async function readFile(path) {
  try {
    const data = await fs.readFile(path, fileOpts);
    return data
  } catch (err) {
    console.error("Error reading file:", err);
  }
}

async function writeFile(path, content) {
  try {
    await fs.writeFile(path, content, fileOpts);
  } catch (err) {
    console.error("Error saving file:", err);
  }
}

export { fileExists, readFile, writeFile }

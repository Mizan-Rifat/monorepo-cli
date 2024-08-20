import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs, { readdirSync } from 'fs';
import enquirer from 'enquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { AutoComplete } = enquirer;

const relativeFilePath = '../.vscode/settings.json';
const absoluteFilePath = path.join(__dirname, relativeFilePath);
const appsPath = path.join(__dirname, '../apps');
const excludedApps = ['dev-doc'];

fs.readFile(absoluteFilePath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    return;
  }

  const initial = Object.keys(jsonData['files.exclude'])
    .filter(app => !jsonData['files.exclude'][app])
    .map(app => app.split('/')[1]);

  const apps = readdirSync(appsPath, { withFileTypes: true })
    .filter(dirent => {
      return dirent.isDirectory() && !excludedApps.includes(dirent.name);
    })
    .map(dirent => dirent.name);

  const prompt = new AutoComplete({
    name: 'apps',
    message:
      'Press arrow keys to naviage and space to select/deselect apps. Press enter to confirm.',
    multiple: true,
    choices: [...apps],
    initial: initial.filter(app => !excludedApps.includes(app))
  });

  const answer = await prompt.run();

  apps.forEach(app => {
    jsonData['files.exclude'][`apps/${app}`] = !answer.includes(app);
  });

  const updatedJsonData = JSON.stringify(jsonData, null, 2);

  fs.writeFile(absoluteFilePath, updatedJsonData, 'utf8', writeErr => {
    if (writeErr) {
      console.error('Error writing to file:', writeErr);
      return;
    }
    console.log('Checkout successfull.');
  });
});

import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import * as prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createVscodeFolder = async ({ projectName, projectPath, projects }) => {
  fs.mkdirSync(path.join(projectPath, `.vscode-${projectName}`));
  fs.mkdirSync(path.join(projectPath, `.vscode`));

  const templateSource = fs.readFileSync(
    path.join(__dirname, './templates/vscode-settings-json.hbs'),
    'utf8'
  );

  const compiledFunction = Handlebars.compile(templateSource);

  const result = compiledFunction({
    projects
  });

  const formatted = await prettier.format(result, {
    parser: 'json',
    trailingComma: false
  });

  fs.writeFileSync(path.join(projectPath, `.vscode-${projectName}`, 'settings.json'), formatted);
  fs.writeFileSync(path.join(projectPath, `.vscode`, 'settings.json'), formatted);
};

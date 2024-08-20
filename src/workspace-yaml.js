import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createWSYamlFile = projectPath => {
  const templateSource = fs.readFileSync(
    path.join(__dirname, './templates/pnpm-workspace.hbs'),
    'utf8'
  );

  const compiledFunction = Handlebars.compile(templateSource);

  const result = compiledFunction({
    directory: 'apps'
  });
  fs.writeFileSync(path.join(projectPath, 'pnpm-workspace.yaml'), result);
};

import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import * as prettier from 'prettier';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const makeCamelCase = str =>
  str
    .split('-')
    .map((e, i) => (i ? e.charAt(0).toUpperCase() + e.slice(1).toLowerCase() : e.toLowerCase()))
    .join('');

const copyPackageJson = async ({ projectName, projectPath }) => {
  const templateSource = fs.readFileSync(
    path.join(__dirname, './templates/package_json.hbs'),
    'utf8'
  );

  const compiledFunction = Handlebars.compile(templateSource);
  const packages = ['dotenv', 'dotenv-cli', 'syncpack', 'turbo', 'enquirer', 'glob', 'sharp'];

  const requests = await axios.all(
    packages.map(packageName => axios.get(`https://registry.npmjs.org/${packageName}/latest`))
  );

  const dependecies = requests.reduce((acc, request) => {
    acc[makeCamelCase(request.data.name)] = request.data.version;
    return acc;
  }, {});

  console.log({ dependecies });

  const result = compiledFunction({
    projectName,
    dependecies
  });

  const formatted = await prettier.format(result, {
    parser: 'json',
    trailingComma: false
  });

  fs.writeFileSync(path.join(projectPath, 'package.json'), formatted);
};

export const copyResources = ({ projectPath, projectName }) => {
  fs.copyFile(
    path.join(__dirname, 'resource/gitignore-resource'),
    path.join(projectPath) + '/.gitignore',
    err => {
      if (err) throw err;
    }
  );

  fs.copyFile(
    path.join(__dirname, 'resource/turbo.json'),
    path.join(projectPath) + '/turbo.json',
    err => {
      if (err) throw err;
    }
  );

  fs.cpSync(path.join(__dirname, 'resource/scripts'), path.join(projectPath) + '/scripts', {
    recursive: true
  });

  copyPackageJson({ projectName, projectPath });
};

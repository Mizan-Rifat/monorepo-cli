#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import path, { dirname } from 'path';
import fs from 'fs';
import pug from 'pug';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import { createWSYamlFile } from './workspace-yaml.js';
import { createVscodeFolder } from './vscode-folder-create.js';
import { copyResources } from './copy-resource.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

program.name('create-mr').description('CLI to some JavaScript string utilities').version('1.0.0');

program
  .command('create')
  .description('Create a monorepo')
  .argument('<project-name>', 'string to split')
  // .option('--first', 'display just the first substring')
  // .option('-s, --separator <char>', 'separator character', ',')
  .action(projectName => {
    const CWD = process.cwd();

    const questions = [{ name: 'projects', message: 'Project names?' }];

    inquirer.prompt(questions).then(answers => {
      console.log({ answers });

      const projectPath = path.join(CWD, projectName);

      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath);

        const projects = answers.projects.split(' ').filter(i => i);
        projects.forEach(project => {
          fs.mkdirSync(path.join(projectPath, `apps/${project}`), { recursive: true });
        });

        createVscodeFolder({ projectName, projectPath, projects });

        copyResources({ projectPath, projectName });
      }

      createWSYamlFile(projectPath);
    });
  });

program.parse();

import arg from 'arg';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { createProject } from './commands/init';
import { dockerComposeUp, dockerComposeDown } from './commands/services';

const program = require('commander');

program
    .version('0.15.0') // get version from Botfront package.json
    .description('Botfront CLI');

program
    .command('init')
    .description('Creates a new Botfront project.')
    .action(initCommand);

program
    .command('up')
    .description('Starts a Botfront project.')
    .action(dockerComposeUp);

program
    .command('down')
    .description('Stops a Botfront project and releases Docker resources.')
    .action(dockerComposeDown);


async function initCommand() {
    const questions = [];
    const currentDirEmpty = fs.readdirSync(process.cwd()).length === 0;
    if (currentDirEmpty) {
        const { current } = await inquirer.prompt({
            type: 'confirm',
            name: 'current',
            message:
                'Do you want to create a new project in the current (empty) directory?',
            default: true
        });
        if (current) return createProject(process.cwd());
    } else {
        const { subDir } = await inquirer.prompt({
            type: 'input',
            name: 'subDir',
            message:
                'A subdirectory will be created with your project. How do you want to name it?',
            default: 'my-project'
        });
        await createProject(path.join(process.cwd(), subDir));
    }
}

program.parse(process.argv);

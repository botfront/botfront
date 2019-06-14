import open from 'open'
import ora from 'ora';
import boxen from 'boxen';
import inquirer from 'inquirer';
import shell from 'shelljs';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createProject } from './commands/init';
import {
    dockerComposeUp,
    dockerComposeDown,
    dockerComposeFollow,
    dockerComposeStop,
    dockerComposeStart,
    dockerComposeRestart,
    stopRunningProjects,
    getRunningDockerResources,
} from './commands/services';
import { wait, isProjectDir, verifySystem, getBotfrontVersion } from './utils';

const program = require('commander');
const version = getBotfrontVersion();

program
    .version(version)
    .description('Botfront CLI')
    .action(() => console.log('test'));

program
    .command('init')
    .description('Create a new Botfront project.')
    .action(initCommand);

program
    .command('up')
    .option('-v, --verbose', 'Display Docker Compose start-up logs')
    .description('Start a Botfront project.  Must be executed in your project\'s directory')
    .action(dockerComposeUp);

program
    .command('down')
    .option('-v, --verbose', 'Display Docker Compose start-up logs')
    .description('Stops a Botfront project and releases Docker resources.  Must be executed in your project\'s directory')
    .action(dockerComposeDown);

program
    .command('logs')
    .option('-v, --verbose', 'Display Docker Compose start-up logs')
    .description('Display botfront logs. Must be executed in your project\'s directory')
    .action(dockerComposeFollow);

program
    .command('killall')
    .description('Stops any running Botfront project')
    .action(killAllCommand);

program
    .command('stop')
    .description('Stop a Botfront service (interactive). Must be executed in your project\'s directory')
    .action(dockerComposeStop);
 
program
    .command('start')
    .description('Start a Botfront service (interactive). Must be executed in your project\'s directory')
    .action(dockerComposeStart);

program
    .command('restart')
    .description('restart a Botfront service (interactive). Must be executed in your project\'s directory')
    .action(dockerComposeRestart);
    
program
    .command('docs')
    .description('Open the online documentation in your browser')
    .action(openDocs);

async function openDocs() {
    const spinner = ora()
    spinner.start(`Opening ${chalk.green.bold('https://docs.botfront.io')} in your browser...`)
    await wait(2000);
    await open('https://docs.botfront.io')
    spinner.succeed(`Done`)
    console.log('\n');
}
    
async function killAllCommand() {
    const { stop } = await inquirer.prompt({
        type: 'confirm',
        name: 'stop',
        message: 'This will stop any running Botfront project. Proceed ?',
        default: true
    });
    if (stop)
        stopRunningProjects(
            'Attempting to stop a running project...',
            `A project was stopped and all its resources released. Your data is safe and you can always restart it by running ${chalk.cyan.bold(
                'botront up'
            )} from your project\'s folder.\n`,
            'All clear, no project is running, there is nothing to kill 👍.',
            ora(),
        );
}

async function initCommand() {
    try {
        await verifySystem();
        const questions = [];
        const currentDirEmpty = fs.readdirSync(process.cwd()).length === 0;
        if (currentDirEmpty) {
            const { current } = await inquirer.prompt({
                type: 'confirm',
                name: 'current',
                message:
                    'Create a new project in the current directory?',
                default: true
            });
            if (current) return createProject(process.cwd());
        } else {
            const { subDir } = await inquirer.prompt({
                type: 'input',
                name: 'subDir',
                message:
                    'The project will be created in a subdirectory. How do you want to name it?',
                default: 'my-botfront-project'
            });
            const projectPath = path.join(process.cwd(), subDir);
            if (fs.existsSync(projectPath)) return console.log(boxen(`${chalk.red('ERROR:')} the directory ${chalk.blueBright.bold(subDir)} already exists. Run ${chalk.cyan.bold('botfront init')} again and choose another directory.`))
            fs.mkdirSync(projectPath);
            await createProject(projectPath);
        }
    } catch (e) {
        console.log(boxen(e))
    }
}

async function general() {
    const choices = [];
    try {
        await verifySystem()
        const { containers, networks, volumes } = await getRunningDockerResources()
        if (isProjectDir()){
            if (containers && containers.length){
                choices.push({ title: 'Stop running project', cmd: () => dockerComposeDown({ verbose: false }) });
            } else {
                choices.push({ title: 'Start project', cmd: () => dockerComposeUp({ verbose: false })});
            }
            
        } else {
            choices.push({ title: 'Create a new project', cmd: initCommand });
        }
        choices.push({ title: 'Browse the online documentation', cmd: openDocs});
        // if ((networks.length || volumes.length) && !containers.length) {
        //     choices.push({ title: 'Clean up Docker resources resources', cmd: () => dockerComposeDown({ verbose: false }) });
        // }
        choices.push({ title: 'More options (display the --help)', cmd: () => shell.exec('botfront -h') });
        choices.push({ title: 'Exit', cmd:  () => process.exit(0) });
        console.log(boxen(`Welcome to ${chalk.green.bold('Botfront')}!\nversion: ${getBotfrontVersion()}`,  { padding: 1,  margin: 1 }));
        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: `What do you want to do?`,
            choices: choices.map(choice => choice.title),
        });
        choices.find(c => c.title === action).cmd()
    
    } catch (e) {
        console.log(boxen(e, { padding: 1 }))
    }
}

const commandr = program.parse(process.argv);
if (commandr.rawArgs.length == 2) general();

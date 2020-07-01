import open from 'open'
import ora from 'ora';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';
import { Docker } from 'docker-cli-js';
import boxen from 'boxen';
import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import {
    dockerComposeUp,
    dockerComposeDown,
    dockerComposeFollow,
    dockerComposeStop,
    dockerComposeStart,
    dockerComposeRestart,
    stopRunningProjects,
    getRunningDockerResources,
    watchFolder,
    doMinorUpdate,
} from './commands/services';
import {
    wait,
    isProjectDir,
    verifySystem,
    getBotfrontVersion,
    failSpinner,
    stopSpinner,
    getContainerAndImageNames,
    succeedSpinner,
    consoleError,
    displayNpmUpdateMessage,
    displayProjectUpdateMessage,
    isMinorUpdate,
} from './utils';

const program = require('commander');
const version = getBotfrontVersion();

function collect(value, previous) {
    return previous.concat([value]);
}

program
    .version(version)
    .description('Botfront CLI')
    .action(() => console.log(`\n${chalk.red.bold('ERROR:')} Unsupported command. Run ${chalk.cyan.bold('botfront --help')} for more information.\n`));

program
    .command('init')
    .option('--path <path>', 'Desired project path')
    .option('--cloud', 'Create a project with an actions server to be used with Botfront Cloud.')
    .option('--img-botfront <image:tag>', 'Image for the botfront service')
    .option('--img-botfront-api <image:tag>', 'Image used by the botfront-api service')
    .option('--img-rasa <image:tag>', 'Image used by the Rasa service')
    .option('--ci', 'No spinners, no prompt confirmations')
    .option('--enable-mongo-auth', 'Set up MongoDB with password authentication.')
    .description('Create a new Botfront project.')
    .action(initCommand);

program
    .command('up')
    .option('-e, --exclude <service>', 'Do not run a given service', collect, [])
    .option('-v, --verbose', 'Display Docker Compose start-up logs')
    .option('--ci', 'No spinners, no prompt confirmations')
    .description('Start a Botfront project.  Must be executed in your project\'s directory')
    .action(dockerComposeUp);

program
    .command('down')
    .option('-v, --verbose', 'Display Docker Compose start-up logs')
    .description('Stops a Botfront project and releases Docker resources.  Must be executed in your project\'s directory')
    .action(dockerComposeDown);

program
    .command('logs')
    .option('--ci', 'Print out logs once and do not hook to TTY')
    .description('Display botfront logs. Must be executed in your project\'s directory')
    .action(dockerComposeFollow);

program
    .command('killall')
    .option('--remove-images', 'Will also remove Botfront related Docker images')
    .description('Stops any running Botfront project')
    .action(killAllCommand);

program
    .command('stop <service>')
    .description('Stop a Botfront service (interactive). Must be executed in your project\'s directory')
    .action(dockerComposeStop);

program
    .command('start <service>')
    .description('Start a Botfront service (interactive). Must be executed in your project\'s directory')
    .action(dockerComposeStart);

program
    .command('restart <service>')
    .description('Restart a Botfront service (interactive). Must be executed in your project\'s directory')
    .action(dockerComposeRestart);

program
    .command('watch')
    .description('Restart the Actions service automatically on file change. Must be executed in your project\'s directory')
    .action(watchFolder);

program
    .command('docs')
    .description('Open the online documentation in your browser')
    .action(openDocs);

program
    .command('update')
    .description('Update a project if the current Botfront version as a higher minor version but not a different major version')
    .action(doMinorUpdate);

async function openDocs() {
    const spinner = ora()
    spinner.start(`Opening ${chalk.green.bold('https://botfront.io/docs')} in your browser...`)
    await wait(2000);
    await open('https://botfront.io/docs')
    spinner.succeed('Done')
    console.log('\n');
}

async function killAllCommand(cmd) {
    const { stop } = await inquirer.prompt({
        type: 'confirm',
        name: 'stop',
        message: 'This will stop any running Botfront project and cleanup remaining Docker resources. This will not affect your project\'s data. Proceed ?',
        default: true,
    });
    if (stop){
        const spinner = ora();
        try {
            await stopRunningProjects(
                'Attempting to stop a running project...',
                `A project was stopped and all its resources released. Your data is safe and you can always restart it by running ${chalk.cyan.bold(
                    'botront up',
                )} from your project\'s folder.\n`,
                'All clear 👍.',
                spinner,
            );

            cleanupDocker({rm: true, rmi: cmd.removeImages}, spinner)

            stopSpinner(spinner)
        } catch (e) {
            failSpinner(spinner, e);
        }
    }
}

async function general() {
    const choices = [];
    try {
        await verifySystem()
        await displayNpmUpdateMessage();
        const { containers } = await getRunningDockerResources()
        if (isProjectDir()){
            if (containers && containers.length){
                choices.push({ title: 'Stop Botfront', cmd: () => dockerComposeDown({ verbose: false }) });
                choices.push({ title: 'Show logs', cmd: () => dockerComposeFollow({}) });
            } else {
                choices.push({ title: 'Start project', cmd: () => dockerComposeUp({ verbose: false })});
            }

            if (isMinorUpdate()){
                choices.push({ title: `Update project to Botfront ${getBotfrontVersion()}`, cmd: doMinorUpdate});
            }
        } else {
            if (containers && containers.length){
                choices.push({ title: 'Stop Botfront', cmd: () => killAllCommand({ verbose: false }) });
            }
            choices.push({ title: 'Create a new project', cmd: initCommand });
        }
        choices.push({ title: 'Browse the online documentation', cmd: openDocs});
        choices.push({ title: 'More options (display the --help)', cmd: () => shell.exec('botfront -h') });
        choices.push({ title: 'Exit', cmd:  () => process.exit(0) });
        console.log(boxen(`Welcome to ${chalk.green.bold('Botfront')}!\nversion: ${getBotfrontVersion()}`,  { padding: 1,  margin: 1 }));
        displayProjectUpdateMessage(); console.log('\n')
        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: choices.map(choice => choice.title),
        });
        choices.find(c => c.title === action).cmd()
    } catch (e) {
        console.log(e)
    }
}

async function cleanupDocker({rm, rmi}, spinner = ora()) {
    const composePath = path.resolve(__dirname, '..', 'project-template', '.botfront', 'docker-compose-template.yml');
    const { services } = yaml.safeLoad(fs.readFileSync(composePath), 'utf-8');
    const containersAndImageNames = getContainerAndImageNames(null, services);
    if (rm) runDockerPromises('rm', containersAndImageNames, spinner);
    if (rmi) runDockerPromises('rmi', containersAndImageNames, spinner);
}

async function runDockerPromises(cmd, { containers, images }, spinner) {
    const docker = new Docker({});
    const name = cmd === 'rm' ? 'containers' : 'images';
    const array = cmd === 'rm' ? containers : images;
    const promises = array.map(i => docker.command(`${cmd} ${i}`).catch(()=>{}));
    try {
        await Promise.all(promises);
        return succeedSpinner(spinner, `Docker ${name} removed.`);
    } catch (e) {
        consoleError(e);
        failSpinner(spinner, `Could not remove Docker ${name}.`);
    } finally {
        stopSpinner();
    }
}

const commandr = program.parse(process.argv);
if (commandr.rawArgs.length == 2) general();

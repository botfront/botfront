import open from 'open'
import ora from 'ora';
import boxen from 'boxen';
import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { initCommand, removeDockerImages, removeDockerContainers } from './commands/init';
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
} from './commands/services';
import { wait, isProjectDir, verifySystem, getBotfrontVersion, succeedSpinner, failSpinner, consoleError, stopSpinner } from './utils';

const program = require('commander');
const version = getBotfrontVersion();

program
    .version(version)
    .description('Botfront CLI')
    .action(() => console.log(`Unsupported command. Run ${chalk.cyan.bold('botfront --help')} for more information.`));

program
    .command('init')
    .option('--path <path>', 'Desired project path')
    .option('--img-botfront <botfront>', 'Image for the botfront service')
    .option('--img-botfront-api <botfront-api>', 'Image used by the botfront-api service')
    .option('--img-rasa <rasa>', 'Image used by the Rasa service')
    .option('--ci', 'No spinners, no prompt confirmations')
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
    .option('--remove-containers', 'Will also remove Botfront related Docker containers')
    .option('--remove-images', 'Will also remove Botfront related Docker images')
    .description('Stops any running Botfront project')
    .action(killAllCommand);    

program
    .command('stop [service]')
    .description('Stop a Botfront service (interactive). Must be executed in your project\'s directory')
    .action(dockerComposeStop);
 
program
    .command('start [service]')
    .description('Start a Botfront service (interactive). Must be executed in your project\'s directory')
    .action(dockerComposeStart);

program
    .command('restart [service]')
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

async function openDocs() {
    const spinner = ora()
    spinner.start(`Opening ${chalk.green.bold('https://docs.botfront.io')} in your browser...`)
    await wait(2000);
    await open('https://docs.botfront.io')
    spinner.succeed(`Done`)
    console.log('\n');
}
    
async function killAllCommand(cmd) {
    const { stop } = await inquirer.prompt({
        type: 'confirm',
        name: 'stop',
        message: 'This will stop any running Botfront project and cleanup remaining Docker resources. This will not affect your project\'s data. Proceed ?',
        default: true
    });
    if (stop){
        const spinner = ora();
        try {
            await stopRunningProjects(
                'Attempting to stop a running project...',
                `A project was stopped and all its resources released. Your data is safe and you can always restart it by running ${chalk.cyan.bold(
                    'botront up'
                )} from your project\'s folder.\n`,
                'All clear 👍.',
                spinner,
            );
            if (cmd.removeContainers){
                await removeDockerContainers(spinner)
            }
            
            if (cmd.removeImages) {
                await removeDockerImages(spinner)
            }
            stopSpinner(spinner)
        } catch (e) {
            failSpinner(spinner,"Error.")
            consoleError(e)
        }
        
    }
}

async function general() {
    const choices = [];
    try {
        await verifySystem()
        const { containers, networks, volumes } = await getRunningDockerResources()
        if (isProjectDir()){
            if (containers && containers.length){
                choices.push({ title: 'Stop Botfront', cmd: () => dockerComposeDown({ verbose: false }) });
                choices.push({ title: 'Show logs', cmd: dockerComposeFollow });
            } else {
                choices.push({ title: 'Start project', cmd: () => dockerComposeUp({ verbose: false })});
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
        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: `What do you want to do?`,
            choices: choices.map(choice => choice.title),
        });
        choices.find(c => c.title === action).cmd()
    
    } catch (e) {
        console.log(e)
    }
}

const commandr = program.parse(process.argv);
if (commandr.rawArgs.length == 2) general();

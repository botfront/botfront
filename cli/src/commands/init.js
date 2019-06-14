import chalk from 'chalk';
import shell from 'shelljs';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import { URL } from 'url';
import { Docker } from 'docker-cli-js';
import ora from 'ora';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { dockerComposeUp } from './services';
import { getComposeFilePath, fixDir, getServices, updateProjectFile, generateDockerCompose } from '../utils';


const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(templateDirectory, targetDirectory, spinner = ora()) {
    spinner.start('Copying project files...');
    try {
        await copy(templateDirectory, targetDirectory, {
            clobber: false
        });
        updateProjectFile()
        generateDockerCompose()
        spinner.stop();
    } catch (e) {
        spinner.fail(e.message);
    }
}

export async function pullDockerImages(images, 
        message = `Downloading Docker images... This can take a while, why don\'t you grab a ☕ and read the ${chalk.cyan('http://docs.botfront.io')} 😉?`, 
        spinner = ora()) {
    const docker = new Docker({});
    spinner.start('Checking Docker images...');
    let download = false;
    const timeout = setTimeout(() => {
        spinner.start(message);
        download = true;
    }, 3000);
    const pullPromises = images.map(i => docker.command(`pull ${i}`));
    try {
        await Promise.all(pullPromises);
        if (download) return spinner.succeed('Docker images ready.');
    } catch (e) {
        spinner.fail('Could not download Docker images');
        throw(e);
    } finally {
        clearTimeout(timeout);
    }
}

export async function createProject(targetDirectory) {
    shell.cd(targetDirectory);
    const currentFileUrl = import.meta.url;
    const templateDir = path.resolve(
        new URL(currentFileUrl).pathname,
        '../../../project-template'
    );
    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.log(templateDir)
        console.error(`${chalk.green.bold('ERROR')} Invalid template path: ${err}`);
        process.exit(1);
    }

    try {
        await copyTemplateFiles(templateDir, targetDirectory);
        await pullDockerImages(getServices());
        
        console.log(`\n\n        🎉 🎈 ${chalk.green.bold('Your project is READY')}! 🎉 🎈\n`);
        const message = `Useful commands:\n\n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront up')} to start your project \n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront --help')} to see all you can do with the CLI\n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront docs')} to browse the online documentation`;
        console.log(boxen(message) + '\n');

        const installedHere = process.cwd() === targetDirectory;
        if (!installedHere) {
            shell.cd(targetDirectory);
        }
        
        const { start } = await inquirer.prompt({
            type: 'confirm',
            name: 'start',
            message: `${chalk.green.bold('Start your project?')}`,
            default: true
        });

        if (start) dockerComposeUp({ verbose: false })
    } catch (e) {
      console.error(`${chalk.red.bold('ERROR')} ${e}`);
      process.exit(1)
    }
    return true;
}

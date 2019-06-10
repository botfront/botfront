import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import { URL } from 'url';
import yaml from 'js-yaml';
import { Docker } from 'docker-cli-js';
import ora from 'ora';


const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(templateDirectory, targetDirectory) {
    const spinner = ora();
    spinner.start('Copying project files...');
    try {
        const result = copy(templateDirectory, targetDirectory, {
            clobber: false
        });
        spinner.succeed('Project files ready.');
    } catch (e) {
        spinner.fail(e.message);
    }
}

export function getDockerImages(composeFilePath) {
    const services = yaml.safeLoad(fs.readFileSync(composeFilePath, 'utf-8'))
        .services;
    return Object.keys(services)
        .filter(s => !!services[s].image)
        .map(s => services[s].image);
}

export async function pullDockerImages(images) {
    const docker = new Docker({});
    const spinner = ora(
        'Downloading Docker images... This can take up to 10 minutes. Grab a ☕ and read the docs 😉'
    );
    spinner.start();
    const pullPromises = images.map(i => docker.command(`pull ${i}`));
    try {
        await Promise.all(pullPromises);
        spinner.succeed('Docker images downloaded.');
    } catch (e) {
        spinner.fail('Could not download Docker images');
        throw(e);
    }
}

export async function createProject(targetDirectory) {
    const currentFileUrl = import.meta.url;
    const templateDir = path.resolve(
        new URL(currentFileUrl).pathname,
        '../../../project-template'
    );
    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.log(templateDir)
        console.error(`${chalk.green.bold('ERROR')} Invalid template name: ${err}`);
        process.exit(1);
    }
    try {
        await copyTemplateFiles(templateDir, targetDirectory);
        await pullDockerImages(
            getDockerImages(`${templateDir}/docker-compose.yml`)
        );
        
        console.log(`${chalk.green.bold('DONE')} Your project is ready!`);
        const installedHere = process.cwd() === targetDirectory;
        if (!installedHere) {
            const cd = `cd ${targetDirectory}`;
            console.log(`run ${chalk.cyan.bold(cd)} to go to your project.`);
        }
        console.log(
            `${installedHere ? 'Then run' : 'Run'} ${chalk.cyan.bold(
                'botfront up'
            )} to start your project.`
        );
    } catch (e) {
      console.error(`${chalk.red.bold('ERROR')} ${e}`);
      process.exit(1)
    }
    return true;
}

import chalk from 'chalk';
import shell from 'shelljs';
import yaml from 'js-yaml';
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
import { uniqueNamesGenerator } from 'unique-names-generator';
import {
    getServices, updateProjectFile, generateDockerCompose, failSpinner, startSpinner, succeedSpinner, verifySystem, consoleError, stopSpinner, getMissingImgs, getContainerNames,
} from '../utils';

const access = promisify(fs.access);
const copy = promisify(ncp);

export async function initCommand(cmd) {
    try {
        await verifySystem();
        let images = {};
        if (cmd) {
            images = Object.assign(images, {
                botfront: cmd.imgBotfront,
                'botfront-api': cmd.imgBotfrontApi,
                rasa: cmd.imgRasa,
            });
        }
        
        const currentDirEmpty = fs.readdirSync(process.cwd()).length === 0;
        const ci = cmd && cmd.ci
        const spinner = ci ? null : ora();
        if (!ci && currentDirEmpty) {
            const { current } = await inquirer.prompt({
                type: 'confirm',
                name: 'current',
                message: 'Create a new project in the current directory?',
                default: true,
            });
            if (current) return await createProject(null, images);
        }

        if (!ci && !currentDirEmpty){
            const { subDir } = await inquirer.prompt({
                type: 'input',
                name: 'subDir',
                message:
                    'The project will be created in a subdirectory. How do you want to name it?',
                default: uniqueNamesGenerator({ length: 2 }),
            })
            return await createProject(subDir, images)
        }

        if (cmd && cmd.path) {
            return await createProject(cmd.path, images, ci);
        }
        consoleError('No conditions for anything was met. Nothing to do.')
    } catch (e) {
        consoleError(e)
    }
}

async function copyTemplateFilesToProjectDir(targetAbsolutePath, images) {
    try {
        const templateDir = path.resolve(__dirname, '..', '..', 'project-template');
        await access(templateDir, fs.constants.R_OK);
        await copy(templateDir, targetAbsolutePath, { clobber: false });
        updateProjectFile(targetAbsolutePath, images)
        generateDockerCompose()
    } catch (e) {
        consoleError(e);
    }
}

export async function pullDockerImages(images,
        spinner,
        message = `Downloading Docker images... This may take a while, why don\'t you grab a ☕ and read the ${chalk.cyan('http://docs.botfront.io')} 😉?`,
        ) {
    const docker = new Docker({});
    startSpinner(spinner, 'Checking Docker images')
    let download = false;
    const timeout = setTimeout(() => {
        startSpinner(spinner, message);
        download = true;
    }, 3000);
    const pullPromises = images.map(i => docker.command(`pull ${i}`));
    try {
        await Promise.all(pullPromises);
        if (download) return succeedSpinner(spinner, 'Docker images ready.');
        return stopSpinner(spinner)
    } catch (e) {
        consoleError(e)
        failSpinner(spinner, 'Could not download Docker images');
        throw(e);
    } finally {
        stopSpinner()
        clearTimeout(timeout);
    }
}

export async function removeDockerImages(spinner = ora()) {
    const docker = new Docker({});
    startSpinner(spinner, 'Removing Docker images...')
    const rmiPromises = getServices(dockerComposePath).map(i => docker.command(`rmi ${i}`).catch(()=>{}));
    try {
        await Promise.all(rmiPromises);
        return succeedSpinner(spinner, 'Docker images removed.');
    } catch (e) {
        consoleError(e)
        failSpinner(spinner, 'Could not remove Docker images');
        throw(e);
    } finally {
        stopSpinner()
    }
}

export async function removeDockerContainers(spinner = ora()) {
    const docker = new Docker({});
    // startSpinner(spinner, 'Removing Docker containers...')
    const composePath = path.resolve(__dirname, '..', '..', 'project-template', '.botfront', 'docker-compose-template.yml');
    const { services } = yaml.safeLoad(fs.readFileSync(composePath), 'utf-8');
    const rmPromises = getContainerNames(null, services).map(i => docker.command(`rm ${i}`).catch(()=>{}));
    try {
        await Promise.all(rmPromises);
        return succeedSpinner(spinner, 'Docker containers removed.');
    } catch (e) {
        consoleError(e)
        failSpinner(spinner, 'Could not remove Docker containers');
        throw(e);
    } finally {
        stopSpinner()
    }
}

export async function createProject(targetDirectory, images, ci = false) {
    const spinner = !ci ? ora() : null;
    let projectAbsPath = process.cwd();
    let projectCreatedInAnotherDir = false;
    if (targetDirectory) {
        projectAbsPath = path.join(projectAbsPath, targetDirectory);
        const message = `${chalk.red('ERROR:')} the directory ${chalk.blueBright.bold(targetDirectory)} already exists. Run ${chalk.cyan.bold('botfront init')} again and choose another directory.`
        if (fs.existsSync(projectAbsPath)) return console.log(boxen(message))
        fs.mkdirSync(projectAbsPath);
        shell.cd(projectAbsPath);
        projectCreatedInAnotherDir = true;
    }

    try {
        await copyTemplateFilesToProjectDir(projectAbsPath, images);
        await pullDockerImages(await getMissingImgs(), spinner);
        
        const message = `${chalk.green.bold('Your project has been created.')}\n\n` +
                        `Run ${chalk.cyan.bold(`cd ${targetDirectory} && botfront up`)} to start it.`

        console.log(boxen(message, { padding: 1 }) + '\n');
        if (ci) dockerComposeUp({ verbose: false }, null, null)
    } catch (e) {
        consoleError(e)
        process.exit(1)
    }
    return true;
}

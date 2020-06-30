import chalk from 'chalk';
import shell from 'shelljs';
import fs from 'fs-extra';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import { Docker } from 'docker-cli-js';
import ora from 'ora';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { uniqueNamesGenerator } from 'unique-names-generator';
import {
    updateProjectFile,
    failSpinner,
    startSpinner,
    succeedSpinner,
    verifySystem,
    consoleError,
    stopSpinner,
    displayNpmUpdateMessage,
    randomString,
} from '../utils';

const access = promisify(fs.access);
const copy = promisify(ncp);

export async function initCommand(
    { path, imgBotfront, imgBotfrontApi, imgRasa, ci, enableMongoAuth, cloud } = {},
) {

    await displayNpmUpdateMessage();
    try {
        await verifySystem();
        let images = {};
        if (imgBotfront) images = {...images, botfront: imgBotfront};
        if (imgBotfrontApi) images = {...images, 'botfront-api': imgBotfrontApi};
        if (imgRasa) images = {...images, rasa: imgRasa};

        const currentDirEmpty = fs.readdirSync(process.cwd()).length === 0;
        if (path) return await createProject(path, images, ci, enableMongoAuth, cloud);
        if (!ci && currentDirEmpty) {
            const { current } = await inquirer.prompt({
                type: 'confirm',
                name: 'current',
                message: 'Create a new project in the current directory?',
                default: true,
            });
            if (current) return await createProject(null, images, ci, enableMongoAuth, cloud);
        }

        if (!ci && !currentDirEmpty) {

            const { subDir } = await inquirer.prompt({
                type: 'input',
                name: 'subDir',
                message:
                    'The project will be created in a subdirectory. How do you want to name it?',
                default: uniqueNamesGenerator({ length: 2 }),
            })
            return await createProject(subDir, images, ci, enableMongoAuth, cloud)
        }

        consoleError('Missing path argument to initialize project.')
    } catch (e) {
        consoleError(e)
    }
}

export async function copyTemplateFilesToProjectDir(targetAbsolutePath, images, update, enableMongoAuth = true, cloud,  mongoPassword = randomString()) {
    console.log(cloud)
    try {
        const templateDir = path.resolve(__dirname, '..', '..', `project-template${cloud ? '-actions' : ''}`);
        console.log(cloud)
        await access(templateDir, fs.constants.R_OK);
        console.log(cloud)
        if (update){
            await fs.copy(path.join(templateDir, '.botfront', 'botfront.yml'), path.join(targetAbsolutePath, '.botfront', 'botfront.yml'));
            await fs.copy(path.join(templateDir, '.botfront', 'docker-compose-template.yml'), path.join(targetAbsolutePath, '.botfront', 'docker-compose-template.yml'));
        } else {
            console.log(cloud)
            await copy(templateDir, targetAbsolutePath, { clobber: false });
        }
        updateProjectFile(targetAbsolutePath, images, enableMongoAuth, cloud, mongoPassword);
    } catch (e) {
        consoleError(e);
    }
}

export async function pullDockerImages(images,
    spinner,
    message = `Downloading Docker images... This may take a while, why don\'t you grab a ☕ and read the ${chalk.cyan('http://botfront.io/docs')} 😉?`,
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
        consoleError(e);
        failSpinner(spinner, 'Could not download Docker images');
    } finally {
        stopSpinner()
        clearTimeout(timeout);
    }
}

export async function createProject(targetDirectory, images, ci = false, enableMongoAuth = false, cloud = false) {
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
        await copyTemplateFilesToProjectDir(projectAbsPath, images, false, enableMongoAuth, cloud);
        let command = 'botfront up';
        if (projectCreatedInAnotherDir) {
            command = `cd ${targetDirectory} && ${command}`;
        }
        const message = `${chalk.green.bold('Your project has been created.')}\n\n` +
                        `Run ${chalk.cyan.bold(command)} to start it.`

        console.log(boxen(message, { padding: 1 }) + '\n');
    } catch (e) {
        consoleError(e)
        process.exit(1)
    }
    return true;
}

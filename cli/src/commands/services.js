import shell from 'shelljs';
import open from 'open';
import { Docker } from 'docker-cli-js';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { pullDockerImages, copyTemplateFilesToProjectDir } from './init';
import path from 'path';
import { watch } from 'chokidar';
import {
    fixDir,
    isProjectDir,
    getMissingImgs,
    waitForService,
    getServiceUrl,
    wait,
    shellAsync,
    getServiceNames,
    capitalize,
    getComposeTemplateFile,
    getGeneratedComposeFile,
    generateDockerCompose,
    startSpinner,
    stopSpinner,
    failSpinner,
    succeedSpinner,
    consoleError,
    setSpinnerText,
    setSpinnerInfo,
    updateProjectFile,
    updateEnvFile,
    displayNpmUpdateMessage as displayNpmUpdateMessage,
    getDefaultServiceNames,
    isMajorUpdateWithVersion,
    isMinorUpdateWithVersion,
    getBotfrontVersion,
    getProjectVersion,
    displayProjectUpdateMessage,
    getMongoPassword,
} from '../utils';

async function postUpLaunch(spinner) {
    const serviceUrl = getServiceUrl('botfront');
    setSpinnerText(
        spinner,
        `Opening Botfront (${chalk.green.bold(serviceUrl)}) in your browser...`,
    );
    await wait(2000);
    await open(serviceUrl);
    setSpinnerInfo(spinner, `Visit ${chalk.green(serviceUrl)}`);
    console.log('\n');
}

async function removeDynamicallyBuiltImages() {
    const folderName = path.basename(fixDir());
    const docker = new Docker({});
    try {
        await docker.command(`rmi ${folderName}_rasa ${folderName}_actions`);
    } catch (e) {
        // Do nothing - just in case the images do not exists
    }
}

export async function doMinorUpdate() {
    const botfrontVersion = getBotfrontVersion();
    const projectVersion = getProjectVersion();
    const mongoPassword = getMongoPassword();
    if (isMajorUpdateWithVersion(projectVersion, botfrontVersion)) {
        return console.log(
            boxen(
                `Project was made with Botfront ${chalk.blueBright(
                    projectVersion,
                )} and the currently installed version is ${chalk.green(
                    botfrontVersion,
                )}, which is a major update.\nPlease follow the instructions in the migration guide: ${chalk.cyan.bold(
                    'https://botfront.io/docs/installation/migration-guide/',
                )}.`,
            ),
        );
    }

    if (isMinorUpdateWithVersion(projectVersion, botfrontVersion)) {
        await copyTemplateFilesToProjectDir(fixDir(), {}, true, true, mongoPassword);
        removeDynamicallyBuiltImages();
        return console.log(boxen('Your project was updated successfully 👌.'));
    }

    return console.log(boxen('Everything is up to date 👌.'));
}
export async function dockerComposeUp(
    { verbose = false, exclude = [], ci = false },
    workingDir,
    spinner,
) {
    spinner = spinner ? spinner : ci ? null : ora();
    await displayNpmUpdateMessage();
    const projectAbsPath = fixDir(workingDir);
    shell.cd(projectAbsPath);
    if (!isProjectDir()) {
        const noProjectMessage = `${chalk.yellow.bold(
            'No project found.',
        )} ${chalk.cyan.bold(
            'botfront up',
        )} must be executed from your project's directory`;
        return console.log(boxen(noProjectMessage));
    }
    const isMajorUpdateRequired = await displayProjectUpdateMessage();
    if (isMajorUpdateRequired) process.exit(0);

    updateEnvFile(process.cwd());
    await generateDockerCompose(exclude);
    startSpinner(spinner, 'Starting Botfront...');
    const missingImgs = await getMissingImgs();
    await pullDockerImages(missingImgs, spinner, 'Downloading Docker images...');
    await stopRunningProjects(
        'Shutting down running project first...',
        null,
        null,
        spinner,
    );
    let command = 'docker-compose up -d';
    const services = getServiceNames(workingDir);
    try {
        startSpinner(spinner, 'Starting Botfront...');
        await shellAsync(command, { silent: !verbose });
        if (ci) process.exit(0); // exit now if ci
        if (services.includes('botfront') && !exclude.includes('botfront'))
            await waitForService('botfront');
        stopSpinner();
        console.log(`\n\n        🎉 🎈  Botfront is ${chalk.green.bold('UP')}! 🎉 🎈\n`);
        const message =
            'Useful commands:\n\n' +
            (`\u2022 Run ${chalk.cyan.bold('botfront logs')} to follow logs \n` +
                `\u2022 Run ${chalk.cyan.bold(
                    'botfront watch',
                )} to watch ${chalk.yellow.bold('actions')} and ${chalk.yellow.bold(
                    'rasa',
                )} folders (see ` +
                `${chalk.cyan.bold('https://botfront.io/docs/rasa/custom-actions')})\n` +
                `\u2022 Run ${chalk.cyan.bold('botfront down')} to stop Botfront\n` +
                `\u2022 Run ${chalk.cyan.bold(
                    'botfront --help',
                )} to get help with the CLI\n`);
        console.log(boxen(message) + '\n');

        if (services.includes('botfront') && !exclude.includes('botfront'))
            await postUpLaunch(spinner); // browser stuff is botfront is not excluded
        stopSpinner();
        process.exit(0);
    } catch (e) {
        if (verbose) {
            failSpinner(
                spinner,
                `${chalk.red.bold(
                    'ERROR:',
                )} Something went wrong. Check the logs above for more information ☝️, or try inspecting the logs with ${chalk.red.cyan(
                    'botfront logs',
                )}.`,
            );
            console.log(e);
        } else {
            stopSpinner(spinner);
            failSpinner(spinner, 'Couldn\'t start Botfront. Retrying in verbose mode...', {
                exit: false,
            });
            return dockerComposeUp(
                { verbose: true, exclude: exclude },
                workingDir,
                null,
                spinner,
            );
        }
    }
}

export async function dockerComposeDown({ verbose }, workingDir) {
    if (workingDir) shell.cd(workingDir);
    if (!isProjectDir()) {
        const noProject = chalk.yellow.bold('No project found in this directory.');
        const killall = chalk.cyan.bold('botfront killall');
        const noProjectMessage =
            `${noProject}\n\nIf you don't know where your project is running from,\n` +
            `${killall} will find and shut down any Botfront\nproject on your machine.`;
        return console.log(boxen(noProjectMessage));
    }
    const spinner = ora('Stopping Botfront...');
    spinner.start();
    let command = 'docker-compose down';
    await shellAsync(command, { silent: !verbose });
    spinner.succeed('All services are stopped. Come back soon... 🤗');
}

export async function dockerComposeStop(service, { verbose }, workingDir) {
    await dockerComposeCommand(
        service,
        { name: 'stop', action: 'stopping' },
        verbose,
        workingDir,
    ).catch(consoleError);
}

export async function setProject(bf_project_id) {
    if (!bf_project_id || typeof bf_project_id !== 'string') {
        throw new Error(`Project ID '${bf_project_id}' is not valid.`);
    }
    const { services } = getComposeTemplateFile();
    const { services: actualServices } = getGeneratedComposeFile();
    const exclude = Object.keys(services).filter((k) => !(k in actualServices));
    updateProjectFile({ leaveMongoUrl: true, env: { bf_project_id } });
    // generate compose file without touching .env file
    generateDockerCompose(exclude, undefined, bf_project_id);

    const spinner = ora(
        `Restarting Rasa and action server to serve project '${bf_project_id}'...`,
    );
    spinner.start();
    await shellAsync('docker-compose up -d', { silent: true });
    spinner.succeed(`Successfully switched to project '${bf_project_id}'.`);
}

export async function dockerComposeStart(service, { verbose }, workingDir) {
    await dockerComposeCommand(
        service,
        { name: 'start', action: 'starting' },
        verbose,
        workingDir,
        'It might take a few seconds before services are available...',
    ).catch(consoleError);
}

export async function dockerComposeRestart(service, { verbose }, workingDir) {
    await dockerComposeCommand(
        service,
        { name: 'restart', action: 'restarting' },
        verbose,
        workingDir,
        'It might take a few seconds before services are available...',
    ).catch(consoleError);
}

export async function dockerComposeBuildAndRestart(service, { verbose }) {
    let command = `docker-compose up -d --force-recreate --build ${service}`;
    await shellAsync(command, { silent: verbose }).catch(consoleError);
}

export async function dockerComposeCommand(
    service,
    { name, action },
    verbose,
    workingDir,
    message = '',
) {
    if (workingDir) shell.cd(workingDir);
    if (!isProjectDir()) {
        const noProjectMessage =
            `${chalk.yellow.bold('No project found in this directory.')}\n` +
            (`${chalk.cyan.bold(
                `botfront ${name}`,
            )} must be executed in your project's directory.\n` +
                `${chalk.green.bold(
                    'TIP: ',
                )}if you just created your project, you probably just have to` +
                ` do ${chalk.cyan.bold('cd <your-project-folder>')} and then retry.`);
        return console.log(boxen(noProjectMessage));
    }
    const allowedServices = getServiceNames(workingDir);

    let services = [service];
    let regeneratedDockerCompose = false;
    if (!service || !allowedServices.includes(service)) {
        const defaultServices = getDefaultServiceNames(workingDir);
        if (name === 'start' && defaultServices.includes(service)) {
            // service had been excluded, regenerate docker compose file
            const exclude = defaultServices.filter(
                (s) => ![...allowedServices, service].includes(s),
            );
            regeneratedDockerCompose = await generateDockerCompose(exclude);
        } else {
            const choices = allowedServices.concat(`${capitalize(name)} all services`);
            const { serv } = await inquirer.prompt({
                type: 'list',
                name: 'serv',
                message: `Which service do you want to ${name}?`,
                choices,
            });
            services = serv.endsWith('all services') ? allowedServices : [serv];
        }
    }

    const spinner = ora(`${capitalize(action)} ${services.join(', ')}...`);
    spinner.start();
    const command = regeneratedDockerCompose // if docker-compose file has been regenerated, run 'up -d' instead of 'start', to create container
        ? 'docker-compose up -d --force-recreate'
        : `docker-compose ${name} ${services.join(' ')}`;
    await shellAsync(command, { silent: !verbose });
    spinner.succeed(`Done. ${message}`);
}

export function dockerComposeFollow({ ci = false }, workingDir) {
    if (workingDir) shell.cd(workingDir);
    if (!isProjectDir()) {
        const noProjectMessage =
            `${chalk.yellow.bold(
                'No project found in this directory.',
            )}\nThis command must be executed in your project's root directory.\n` +
            `${chalk.green.bold(
                'TIP: ',
            )}if you just created your project, you probably just have to do ${chalk.cyan.bold(
                'cd <your-project-folder>',
            )} and then retry`;
        return console.log(boxen(noProjectMessage));
    }
    let command = `docker-compose logs${!ci ? ' -f' : ''}`;
    shell.exec(command);
}

export async function getRunningDockerResources() {
    const docker = new Docker({});
    const command = 'container ps --format={{.Names}}';
    const containersCommand = await docker.command(command);
    const containers = containersCommand.raw.match(/(botfront-\w+)/g);
    const networkCommand = await docker.command('network ls --format={{.Name}}');

    const networks = networkCommand.raw.match(/([^\s]+_botfront-network)/g);
    const volumeCommand = await docker.command('volume ls --format={{.Name}}');
    const volumes = volumeCommand.raw.match(/([^\s]+_botfront-db)/g);
    return { containers, networks, volumes };
}

export async function stopRunningProjects(
    runningMessage = null,
    killedMessage = null,
    allDeadMessage = null,
    spinner,
) {
    const docker = new Docker({});
    try {
        const { containers, networks, volumes } = await getRunningDockerResources();

        if (containers && containers.length) {
            startSpinner(spinner, runningMessage);
            await docker.command(`stop ${containers.join(' ')}`);
            await docker.command(`rm ${containers.join(' ')}`);
            if (killedMessage) succeedSpinner(spinner, killedMessage);
        } else {
            if (allDeadMessage) succeedSpinner(spinner, allDeadMessage);
        }
        if (volumes && volumes.length)
            await docker.command(`volume rm ${volumes.join(' ')}`);
        if (networks && networks.length)
            await docker.command(`network rm ${networks.join(' ')}`);
        stopSpinner();
    } catch (e) {
        stopSpinner();
        const failMessage =
            `Could not stop running project. Run ${chalk.cyan.bold(
                'docker ps | grep -w botfront-',
            )} and ` +
            (`then ${chalk.cyan.bold('docker stop <name>')} and ${chalk.cyan.bold(
                'docker rm <name>',
            )} for ` +
                `each running container.\n${chalk.red.bold(e)}\n`);
        failSpinner(spinner, failMessage);
    }
}

export async function watchFolder({ verbose }, workingDir) {
    const spinner = ora();
    const actionsPath = path.join(fixDir(), 'actions');
    const rasaPath = path.join(fixDir(), 'rasa');
    const actionsService = 'actions';
    const watchingMessage = 'Watching for file system changes...';
    const rasaService = 'rasa';

    watch(actionsPath, {
        ignored: /(^|[/\\])\..|pyc|ignore/,
        ignoreInitial: true,
        interval: 1000,
    }).on('all', async () => {
        stopSpinner(spinner);
        await dockerComposeBuildAndRestart(actionsService, { verbose }, workingDir);
        startSpinner(spinner, watchingMessage);
    });

    watch(rasaPath, {
        ignored: /(^|[/\\])\..|pyc|ignore/,
        ignoreInitial: true,
        interval: 1000,
    }).on('all', async () => {
        stopSpinner(spinner);
        await dockerComposeBuildAndRestart(rasaService, { verbose }, workingDir);
        startSpinner(spinner, watchingMessage);
    });

    startSpinner(spinner, 'Watching for file system changes...');
}

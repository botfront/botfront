
import shell from 'shelljs';
import open from 'open';
import { Docker } from 'docker-cli-js';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { pullDockerImages } from './init';
import { fixDir, isProjectDir, getComposeFilePath, getServices, waitForService, getServiceUrl, getComposeWorkingDir, wait, shellAsync, getServiceNames, capitalize, generateDockerCompose } from '../utils';

export async function dockerComposeUp({ verbose }, workingDir) {
    shell.cd(fixDir(workingDir));
    if (!isProjectDir()) {
        const noProjectMessage = `${chalk.yellow.bold('No project found.')} ${chalk.cyan.bold('botfront up')} must be executed from your project\'s directory`;
        return console.log(noProjectMessage);
    }

    const spinner = ora('Starting Botfront...')
    generateDockerCompose();
    spinner.start();
    await pullDockerImages(getServices(), 'Downloading Docker images...', spinner)
    await stopRunningProjects("Another project is running. Shutting it down first...", null, null, spinner);
    let command = `docker-compose -f ${getComposeFilePath()} --project-directory ${getComposeWorkingDir(workingDir)} up -d`;
    try{
        spinner.start('Starting Botfront...')
        await shellAsync(command, { silent: !verbose});
        await waitForService('botfront');
        spinner.stop()
        const serviceUrl = getServiceUrl('botfront');
        console.log(`\n\n        🎉 🎈  Botfront is ${chalk.green.bold('UP')}! 🎉 🎈\n`);
        const message = `Useful commands:\n\n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront logs')} to see logs and debug \n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront <stop|start|restart>')} to <stop|start|restart> a service \n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront down')} to stop Botfront\n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront --help')} to get help with the CLI\n`;
                        `\u2022 Run ${chalk.cyan.bold('botfront docs')} to browse the online documentation\n`;
        console.log(boxen(message) + '\n');
        spinner.start(`Opening Botfront (${chalk.green.bold(serviceUrl)}) in your browser...`)
        await wait(3000);
        await open(serviceUrl)
        spinner.info(`Visit ${chalk.green(serviceUrl)}`)
        console.log('\n');
        process.exit(0);
    } catch (e) {
        if (verbose) {
            console.log(e)
            return spinner.fail(`${chalk.red.bold('ERROR:')} Check the logs above for more information. ☝️`);
        }
        // Restarting in verbose
        dockerComposeUp( { verbose: true }, workingDir)
    } finally {
        spinner.stop()
    }
}

export async function dockerComposeDown({ verbose }, workingDir) {
    if (workingDir) shell.cd(workingDir)
    if (!isProjectDir()) {
        const noProjectMessage = `${chalk.yellow.bold('No project found in this directory.')}\n\nIf you don\'t know where your project is running from, ${chalk.cyan.bold('botfront killall')} will find and shut down any Botfront project on your machine.`;
        return console.log(boxen(noProjectMessage));
    }
    const spinner = ora('Stopping Botfront...')
    spinner.start();
    let command = `docker-compose -f ${getComposeFilePath()} --project-directory ${getComposeWorkingDir(workingDir)} down`;
    await shellAsync(command, { silent: !verbose })
    spinner.succeed('All services are stopped. Come back soon... 🤗');
}

export async function dockerComposeStop({ verbose }, workingDir) {
    await dockerComposeCommand({name: 'stop', action: 'stopping'}, verbose, workingDir )
}

export async function dockerComposeStart({ verbose }, workingDir) {
    await dockerComposeCommand({name: 'start', action: 'starting'}, verbose, workingDir, 'It might take a few seconds before services are available...' )
}

export async function dockerComposeRestart({ verbose }, workingDir) {
    await dockerComposeCommand({name: 'restart', action: 'restarting'}, verbose, workingDir, 'It might take a few seconds before services are available...' )
}

export async function dockerComposeCommand({name, action}, verbose, workingDir, message = '') {
    if (workingDir) shell.cd(workingDir)
    if (!isProjectDir()) {
        const noProjectMessage = `${chalk.yellow.bold('No project found in this directory.')}\n${chalk.cyan.bold(`botfront ${name}`)} must be executed in your project's directory.\n${chalk.green.bold('TIP: ')}if you just created your project, you probably just have to do ${chalk.cyan.bold('cd <your-project-folder>')} and then retry.`;
        return console.log(boxen(noProjectMessage));
    }
    const allowedServices = getServiceNames(workingDir);
    const services = allowedServices.concat(`${capitalize(name)} all services`);
    const { service } = await inquirer.prompt({
        type: 'list',
        name: 'service',
        message: `Which service do you want to ${name}?`,
        choices: services,
    });
    
    const spinner = ora(service ? `${capitalize(action)} service ${service}...`: `${capitalize(action)} all services...`)
    spinner.start();
    let command = `docker-compose -f ${getComposeFilePath()} --project-directory ${getComposeWorkingDir(workingDir)} ${name} ${allowedServices.includes(service) ? service : ''}`;
    await shellAsync(command, { silent: !verbose })
    spinner.succeed(`Done. ${message}`);
}

export function dockerComposeFollow(commander, workingDir) {
    if (workingDir) shell.cd(workingDir)
    if (!isProjectDir()) {
        const noProjectMessage = `${chalk.yellow.bold('No project found in this directory.')}\nThis command must be executed in your project's root directory.\n`+
        `${chalk.green.bold('TIP: ')}if you just created your project, you probably just have to do ${chalk.cyan.bold('cd <your-project-folder>')} and then retry`;
        return console.log(boxen(noProjectMessage));
    }
    let command = `docker-compose -f ${getComposeFilePath()} --project-directory ${getComposeWorkingDir(workingDir)} logs `;
    shell.exec(command)
}

export async function getRunningDockerResources() {
    const docker = new Docker({});
    const command = 'container ps --format={{.Names}}'
    const containersCommand = await docker.command(command);
    const containers = containersCommand.raw.match(/(botfront-\w+)/g);
    const networkCommand = await docker.command('network ls --format={{.Name}}');

    const networks = networkCommand.raw.match(/([^\s]+_botfront-network)/g);
    const volumeCommand = await docker.command('volume ls --format={{.Name}}');
    const volumes = volumeCommand.raw.match(/([^\s]+_botfront-db)/g);
    return { containers, networks, volumes };
}

export async function stopRunningProjects(
        runningMessage=null, 
        killedMessage = null, 
        allDeadMessage = null, 
        spinner) {
    const docker = new Docker({});
    const command = 'container ps --format={{.Names}}'
    try{
        const { containers, networks, volumes } = await getRunningDockerResources();
        
        if (containers && containers.length) {           
            spinner.start(runningMessage)
            await docker.command(`stop ${containers.join(" ")}`);
            await docker.command(`rm ${containers.join(" ")}`);
            if (killedMessage) spinner.succeed(killedMessage);    
        } else {
            if (allDeadMessage) spinner.succeed(allDeadMessage)
        }
        if (volumes && volumes.length) await docker.command(`volume rm ${volumes.join(" ")}`)
        if (networks && networks.length) await docker.command(`network rm ${networks.join(" ")}`);
    } catch(e) {
        spinner.fail(`Could not stop running project. Run ${chalk.cyan.bold('docker ps | grep -w botfront-')} and then ${chalk.cyan.bold('docker stop <name>')} and ${chalk.cyan.bold('docker rm <name>')} for each running container.\n${chalk.red.bold(e)}\n`);
    } finally {
        spinner.stop()
    }
}
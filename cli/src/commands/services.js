
import shell from 'shelljs';
import open from 'open';
import { Docker } from 'docker-cli-js';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { pullDockerImages } from './init';
import { fixDir, isProjectDir, getComposeFilePath, getServices, getMissingImgs, waitForService, getServiceUrl, getComposeWorkingDir, wait, shellAsync, getServiceNames, capitalize, generateDockerCompose, startSpinner, stopSpinner, failSpinner, succeedSpinner, consoleError, setSpinnerText } from '../utils';

export async function dockerComposeUp({ verbose = false }, workingDir, spinner = ora()) {
    shell.cd(fixDir(workingDir));
    if (!isProjectDir()) {
        const noProjectMessage = `${chalk.yellow.bold('No project found.')} ${chalk.cyan.bold('botfront up')} must be executed from your project\'s directory`;
        return console.log(noProjectMessage);
    }
    generateDockerCompose();
    startSpinner(spinner, 'Starting Botfront...')
    const missingImgs = await getMissingImgs()
    await pullDockerImages(missingImgs, spinner, 'Downloading Docker images...')    
    await stopRunningProjects("Another project is running. Shutting it down first...", null, null, spinner);
    let command = `docker-compose -f ${getComposeFilePath()} --project-directory ${getComposeWorkingDir(workingDir)} up -d`;
    try{
        startSpinner(spinner, 'Starting Botfront...')
        await shellAsync(command, { silent: !verbose });
        await waitForService('botfront');
        stopSpinner()
        const serviceUrl = getServiceUrl('botfront');
        console.log(`\n\n        🎉 🎈  Botfront is ${chalk.green.bold('UP')}! 🎉 🎈\n`);
        const message = `Useful commands:\n\n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront logs')} to see logs and debug \n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront <stop|start|restart>')} to <stop|start|restart> a service \n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront down')} to stop Botfront\n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront --help')} to get help with the CLI\n`;
                        `\u2022 Run ${chalk.cyan.bold('botfront docs')} to browse the online documentation\n`;
        console.log(boxen(message) + '\n');
        setSpinnerText(spinner, `Opening Botfront (${chalk.green.bold(serviceUrl)}) in your browser...`)
        await wait(3000);
        await open(serviceUrl)
        spinner.info(`Visit ${chalk.green(serviceUrl)}`)
        console.log('\n');
        stopSpinner();
        process.exit(0);
    } catch (e) {
        if (verbose) {
            failSpinner(spinner, `${chalk.red.bold('ERROR:')} Something went wrong. Check the logs above for more information ☝️, or try inspecting the logs with ${chalk.red.cyan('botfront logs')}.`);
        } else {
            stopSpinner(spinner);
            failSpinner(spinner, 'Couldn\'t start Botfront. Retrying in verbose mode...');
            return dockerComposeUp({ verbose: true }, workingDir, null, true)
        }   
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

export async function dockerComposeStop(service, { verbose }, workingDir) {
    await dockerComposeCommand(service, {name: 'stop', action: 'stopping'}, verbose, workingDir ).catch(consoleError)
}

export async function dockerComposeStart(service, { verbose }, workingDir) {
    await dockerComposeCommand(service, {name: 'start', action: 'starting'}, verbose, workingDir, 'It might take a few seconds before services are available...' ).catch(consoleError)
}

export async function dockerComposeRestart(service, { verbose }, workingDir) {
    await dockerComposeCommand(service, {name: 'restart', action: 'restarting'}, verbose, workingDir, 'It might take a few seconds before services are available...' ).catch(consoleError)
}

export async function dockerComposeCommand(service, {name, action}, verbose, workingDir, message = '') {
    if (workingDir) shell.cd(workingDir)
    if (!isProjectDir()) {
        const noProjectMessage = `${chalk.yellow.bold('No project found in this directory.')}\n${chalk.cyan.bold(`botfront ${name}`)} must be executed in your project's directory.\n${chalk.green.bold('TIP: ')}if you just created your project, you probably just have to do ${chalk.cyan.bold('cd <your-project-folder>')} and then retry.`;
        return console.log(boxen(noProjectMessage));
    }
    const allowedServices = getServiceNames(workingDir);
    if (!service || !allowedServices.includes(service)) {
        const services = allowedServices.concat(`${capitalize(name)} all services`);
        const { serv } = await inquirer.prompt({
            type: 'list',
            name: 'serv',
            message: `Which service do you want to ${name}?`,
            choices: services,
        });
        service = serv;
    }
    
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
    let command = `docker-compose -f ${getComposeFilePath()} --project-directory ${getComposeWorkingDir(workingDir)} logs -f`;
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
    try{
        const { containers, networks, volumes } = await getRunningDockerResources();
        
        if (containers && containers.length) {           
            startSpinner(spinner, runningMessage)
            await docker.command(`stop ${containers.join(" ")}`);
            await docker.command(`rm ${containers.join(" ")}`);
            if (killedMessage) succeedSpinner(spinner, killedMessage);    
        } else {
            if (allDeadMessage) succeedSpinner(spinner, allDeadMessage)
        }
        if (volumes && volumes.length) await docker.command(`volume rm ${volumes.join(" ")}`)
        if (networks && networks.length) await docker.command(`network rm ${networks.join(" ")}`);
    } catch(e) {
        failSpinner(spinner, `Could not stop running project. Run ${chalk.cyan.bold('docker ps | grep -w botfront-')} and then ${chalk.cyan.bold('docker stop <name>')} and ${chalk.cyan.bold('docker rm <name>')} for each running container.\n${chalk.red.bold(e)}\n`);
    } finally {
        stopSpinner();
    }
}
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import axios from 'axios';
import yaml from 'js-yaml';
export const BF_CONFIG_DIR = '.botfront';
export const DOCKER_COMPOSE_FILENAME = 'docker-compose.yml';
import shell from 'shelljs';
import { Docker } from 'docker-cli-js';
import chalk from 'chalk';
import check from 'check-node-version';
export function fixDir(dir) {
    return dir ? dir : process.cwd();
}

export async function verifySystem() {
    const docker = new Docker();
    const result = await docker.command('info');
    // const version = result.object.server_version;
    if (!result.object) throw `You must install Docker to use Botfront. Please visit ${chalk.green('https://www.docker.com/products/docker-desktop')}`;
    const results = await promisify(check)({ node: ">= 8.9"});
    if (!results.versions.node.isSatisfied) throw `You must upgrade your Node.js installation to use Botfront. Please visit ${chalk.green('https://nodejs.org/en/download/')}`;
}

export function getComposeFilePath(dir) {
    return path.join(fixDir(dir), BF_CONFIG_DIR, DOCKER_COMPOSE_FILENAME);
}

export function isProjectDir(dir) {
    return fs.existsSync(getComposeFilePath(fixDir(dir)));
}

export function getComposeFile(dir) {
    return yaml.safeLoad(fs.readFileSync(getComposeFilePath(dir), 'utf-8'));
}

export function getServices(dir) {
    const services = getComposeFile(dir).services;
    return Object.keys(services)
        .filter(s => !!services[s].image)
        .map(s => services[s].image);
}

export function getServiceNames(dir) {
    const services = getComposeFile(dir).services;
    return Object.keys(services);
}

export function getService(serviceName, dir) {
    return getComposeFile(dir).services[serviceName];
}

export function getExternalPort(serviceName, dir) {
    return getService(serviceName, dir).ports[0].split(':')[0];
}

export function getServiceUrl(serviceName) {
    return `http://localhost:${getExternalPort(serviceName)}`
}

export function getComposeWorkingDir(workingDirectory) {
    return workingDirectory ? workingDirectory : './';
}

export async function wait(millis) {
    return promisify(setTimeout)(millis);
}

export function capitalize(s){
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export async function shellAsync(command, options) {
    return promisify(shell.exec)(command, options);
}

export async function waitForService(serviceName) {
    const serviceUrl = getServiceUrl(serviceName);
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            setTimeout(function() {
                reject()
            }, 90000)

            try{
                const response = await axios.get(serviceUrl);
                if (response.status === 200){
                    clearInterval(interval);
                    return resolve()
                }
            } catch(e) {}
        }, 1000);
    });
}

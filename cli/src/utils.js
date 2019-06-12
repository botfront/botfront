import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import axios from 'axios';
import yaml from 'js-yaml';
export const BF_CONFIG_DIR = '.botfront';
export const BF_CONFIG_FILE = 'botfront.yml';
export const DOCKER_COMPOSE_TEMPLATE_FILENAME = 'docker-compose-template.yml';
export const DOCKER_COMPOSE_FILENAME = 'docker-compose.yml';
import shell from 'shelljs';
import { Docker } from 'docker-cli-js';
import chalk from 'chalk';
import check from 'check-node-version';
export function fixDir(dir) {
    return dir ? dir : process.cwd();
}

export async function updateProjectFile(dir) {
    const config = getProjectConfig(dir);
    config.version = getBotfrontVersion();
    config.tags.current = JSON.parse(JSON.stringify(config.tags.default)); // deep copy
    fs.writeFileSync(getProjectInfoFilePath(dir), yaml.safeDump(config));
}

export async function generateDockerCompose(dir) {
    const dc = getComposeFile(dir, DOCKER_COMPOSE_TEMPLATE_FILENAME);
    const config = getProjectConfig(dir);
    const dcCopy = JSON.parse(JSON.stringify(dc));
    Object.keys(dc.services).forEach( service => {

        const image = dcCopy.services[service].image;
        const splitTag = image.split(':');
        dcCopy.services[service].image = `${splitTag.length > 1 ? splitTag[0] : image}:${config.tags.current[service]}`;
    })
    fs.writeFileSync(getComposeFilePath(dir), yaml.safeDump(dcCopy));
}

export function getProjectConfig(dir) {
    return yaml.safeLoad(fs.readFileSync(getProjectInfoFilePath(dir), 'utf-8'));
}

export async function verifySystem() {
    const docker = new Docker();
    const result = await docker.command('info');
    // const version = result.object.server_version;
    if (!result.object) throw `You must install Docker to use Botfront. Please visit ${chalk.green('https://www.docker.com/products/docker-desktop')}`;
    const results = await promisify(check)({ node: ">= 8.9"});
    if (!results.versions.node.isSatisfied) throw `You must upgrade your Node.js installation to use Botfront. Please visit ${chalk.green('https://nodejs.org/en/download/')}`;
}

export function getBotfrontVersion() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../botfront/package.json'))).version;
}

export function getComposeFilePath(dir, fileName = DOCKER_COMPOSE_FILENAME) {
    return path.join(fixDir(dir), BF_CONFIG_DIR, fileName);
}

export function getProjectInfoDirPath(dir) {
    return path.join(fixDir(dir), BF_CONFIG_DIR);
}

export function getProjectInfoFilePath(dir) {
    return path.join(fixDir(dir), BF_CONFIG_DIR, BF_CONFIG_FILE );
}

export function isProjectDir(dir) {
    return fs.existsSync(getComposeFilePath(fixDir(dir)));
}

export function getComposeFile(dir, fileName) {
    return yaml.safeLoad(fs.readFileSync(getComposeFilePath(dir, fileName), 'utf-8'));
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

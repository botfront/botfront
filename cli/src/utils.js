import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import axios from 'axios';
import yaml from 'js-yaml';
export const BF_CONFIG_DIR = '.botfront';
export const BF_CONFIG_FILE = 'botfront.yml';
export const DOCKER_COMPOSE_TEMPLATE_FILENAME = 'docker-compose-template.yml';
export const DOCKER_COMPOSE_FILENAME = 'docker-compose.yml';
export const DEFAULT_MODEL_FILENAME = 'default_model.tar.gz';
export const ENV_FILENAME = '.env';
import shell from 'shelljs';
import { Docker } from 'docker-cli-js';
import chalk from 'chalk';
import boxen from 'boxen';
import check from 'check-node-version';
import compareVersions from 'compare-version';

export function fixDir(dir) {
    return dir ? dir : process.cwd();
}

export function consoleError(error) {
    try{
        console.log(boxen(error))
    } catch (e) {
        console.log(error)
    }
}

export function startSpinner(spinner, message) {
    if (spinner) {
        spinner.start(message);
    } else {
        console.log(message)
    }
}

export function setSpinnerText(spinner, message) {
    if (spinner) {
        spinner.text = message;
    } else {
        console.log(message)
    }
}

export function setSpinnerInfo(spinner, message) {
    if (spinner) {
        spinner.info = message;
    } else {
        console.log(message)
    }
}

export function succeedSpinner(spinner, message) {
    if (spinner) {
        spinner.succeed(message);
    } else {
        console.log(message)
    }
}

export function failSpinner(spinner, message, params = {}) {
    const { exit = true } = params;
    if (spinner) {
        spinner.fail(message);
    } else {
        console.log(message)
    }
    if (exit) process.exit(1);
}

export function stopSpinner(spinner) {
    if (spinner) {
        spinner.stop();
    }
}

export async function getLatestVersion() {
    try {
        const response = await axios.get('https://registry.npmjs.org/botfront');
        if (response.status === 200) {
            return response.data['dist-tags'].latest;
        }
        // If the call fails we just return the current version
        return getBotfrontVersion();
    } catch(e) {
        return getBotfrontVersion();
    }
}

export function getProjectVersion() {
    return getProjectConfig(fixDir(null)).version;
}

export function shouldUpdateProject() {
    const botfrontVersion = getBotfrontVersion();
    const projectVersion = getProjectVersion();
    return botfrontVersion !== projectVersion;
}

export async function shouldUpdateNpmPackage() {
    const currentVersion = getBotfrontVersion();
    const latestVersion = await getLatestVersion();
    return compareVersions(latestVersion, currentVersion) == 1;
}

export async function displayUpdateMessage() {
    const shouldUpdate = await shouldUpdateNpmPackage();
    if (shouldUpdate) {
        console.log(boxen(`A new version of Botfront is available. Run ${chalk.cyan.bold('npm install -g botfront')} to update.`,  { padding: 1,  margin: 1 }))
    }
    return shouldUpdate;
}

/*
Augment the botfront.yml file with version and project specific values
*/
export async function updateProjectFile(projectAbsPath, images) {
    const config = getProjectConfig(projectAbsPath);
    if (!config.version) {
        config.version = getBotfrontVersion();
    }
    config.images.current = JSON.parse(JSON.stringify(config.images.default)); // deep copy
    Object.keys(config.images.current).forEach(service => {
        if (images[service]) config.images.current[service] = images[service];
    });
    fs.writeFileSync(getProjectInfoFilePath(projectAbsPath), yaml.safeDump(config));

    updateEnvFile(projectAbsPath);
}

export async function updateEnvFile(projectAbsPath) {
    const config = getProjectConfig(projectAbsPath);
    let envFileContent = '#################################################################\n';
    envFileContent +=    '# This file is generated.                                       #\n';
    envFileContent +=    '# Environment variables can be changed or added in botfront.yml #\n';
    envFileContent +=    '#################################################################\n\n';
    Object.keys(config.env).forEach(variable => {
        envFileContent += `${variable.toUpperCase()}=${config.env[variable]}\n`;
    });

    fs.writeFileSync(getProjectEnvFilePath(projectAbsPath), envFileContent);
}

export async function generateDockerCompose(exclude = [], dir) {
    const dc = getComposeFile(dir, DOCKER_COMPOSE_TEMPLATE_FILENAME);
    exclude.forEach(excl => { // remove reference to excluded services
        if (excl in dc.services) delete dc.services[excl]
        Object.values(dc.services).forEach(service => {
            if ({}.hasOwnProperty.call(service, 'depends_on')) {
                service.depends_on = service.depends_on.filter(depend => depend !== excl);
                if (service.depends_on.length === 0) delete service.depends_on;
            }
        })
    })
    const config = getProjectConfig(dir);
    const dcCopy = JSON.parse(JSON.stringify(dc));
    Object.keys(dc.services).forEach(service => {
        dcCopy.services[service].image = config.images.current[service]
    })
    // for (let key in dcCopy.services) {
    //     console.log(key, dcCopy.services[key].depends_on)
    // }
    fs.writeFileSync(getComposeFilePath(dir), yaml.safeDump(dcCopy));
    return true;
}

export function getProjectConfig(projectAbsPath) {
    return yaml.safeLoad(fs.readFileSync(getProjectInfoFilePath(projectAbsPath), 'utf-8'));
}

export async function verifySystem() {
    const docker = new Docker();
    const result = await docker.command('info');
    // const version = result.object.server_version;
    if (!result.object) throw `You must install Docker to use Botfront. Please visit ${chalk.green('https://www.docker.com/products/docker-desktop')}`;
    const results = await promisify(check)({ node: '>= 8.9'});
    if (!results.versions.node.isSatisfied) {
        throw `You must upgrade your Node.js installation to use Botfront. Please visit ${chalk.green('https://nodejs.org/en/download/')}`
    };
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

export function getProjectEnvFilePath(dir) {
    return path.join(fixDir(dir), BF_CONFIG_DIR, ENV_FILENAME );
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

export async function getMissingImgs(dir) {
    const docker = new Docker({});
    let availableImgs = await docker.command('images --format "{{.Repository}}:{{.Tag}}"');
    availableImgs = availableImgs.raw.split('\n');
    return getServices(dir).filter(service => !availableImgs.includes(service));
}

export function getServiceNames(dir) {
    const services = getComposeFile(dir).services;
    return Object.keys(services);
}

export function getDefaultServiceNames(dir) {
    const services = getComposeFile(dir, DOCKER_COMPOSE_TEMPLATE_FILENAME).services;
    return Object.keys(services);
}

export function getService(serviceName, dir) {
    return getComposeFile(dir).services[serviceName];
}

export function getExternalPort(serviceName, dir) {
    return getService(serviceName, dir).ports[0].split(':')[0];
}

export function getContainerAndImageNames(dir, services) {
    let svcs = services || getComposeFile(dir).services;
    return {
        containers: Object.keys(svcs).map(s => services[s].container_name),
        images: Object.keys(svcs).map(s => services[s].image),
    };
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

            let response;
            try {
                response = await axios.get(serviceUrl);
            } catch (e) {
                response = e.response;
            }
            if (response && [200, 404].includes(response.status)) {
                clearInterval(interval);
                return resolve();
            }
        }, 1000);
    });
}

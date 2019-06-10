export function up() {
    const services = yaml.safeLoad(fs.readFileSync(composeFilePath, 'utf-8'))
        .services;
    return Object.keys(services)
        .filter(s => !!services[s].image)
        .map(s => services[s].image);
}
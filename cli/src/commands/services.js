import shell from 'shelljs';

export function dockerComposeUp(commander, targetDirectory) {
    if (targetDirectory) shell.cd(targetDirectory)
    let command = `docker-compose up -d`;
    shell.exec(command)
}

export function dockerComposeDown(commander, targetDirectory) {
    if (targetDirectory) shell.cd(targetDirectory)
    let command = `docker-compose down`;
    shell.exec(command)
}

export function dockerComposeFollow(commander, targetDirectory) {
    if (targetDirectory) shell.cd(targetDirectory)
    let command = `docker-compose logs -f`;
    shell.exec(command)
}
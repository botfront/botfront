# Setup

## Requirements
You should have recent versions of Docker and Node.js installed on your computer. 
If it's not the case, see [Installing requirements](#installing-requirements) first.


## Installation
In your terminal:

```bash
npm install -g botfront
```

Then...

```bash
botfront
```

And follow the instructions to create a project. After a long while (there's a lot to download) Botfront will open in your browser and invite you to set up your project.

<video autoplay muted loop width="740" controls>
  <source src="../../videos/setup.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

Congrats, you can skip the rest of this page and go directly to the next tutorial.

## Installing requirements

::: tip
This section is only **required if you don't have Node.JS or Docker** installed on your system. If you succesfully completed the steps above, you can safely skip this section
:::

### Install Docker
Just download and execute Docker for [MacOS](https://download.docker.com/mac/stable/Docker.dmg) or [Windows](https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe) 

### Install Node.JS

#### Windows
Download and install [Node.js](https://nodejs.org/en/download/)

If you have a `missing write access to usr/local/lib/node_modules` error when installing Botfront, prepend the command with `sudo`) and use your usual password when prompted:

```bash
sudo npm install -g botfront
```


#### Mac / Linux
Install Node.js via `nvm` to avoid permission errors.

1. Install NVM
   
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

then do `nvm -V`. If you have a `command not found` error, do `touch ~/.bash_profile` and repeat the installation (`curl ...`)

2. Install Node.js

```bash
nvm install --lts 
```
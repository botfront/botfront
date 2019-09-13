---
meta:
  - name: description
    content: 'Botfront tutorial: Rasa CLI'
  - name: keywords
    content: botfront stories nlu rasa
permalink: /getting-started/:slug
---

# Useful CLI commands

Botfront comes with a command line interface (CLI) to manage your projects. You can start the CLI by running `botfront` in your terminal. It will open a contextual menu which contains the options you would need most of the time.

## Main commands

| Command | What it does | Where to run it |
| ------- | --------------- |--------------- |
|`botfront init`| Create a new project | Anywhere |
|`botfront up`| Start Botfront project | from your project folder |
|`botfront down`| Stop Botfront project | from your project folder |
|`botfront logs`| View Botfront logs | from your project folder |
|`botfront watch`| Watch actions files changes | from your project folder |


## Other commands

You can always get help with `botfront --help`

```
Options:
  -V, --version      output the version number
  -h, --help         output usage information

Commands:
  init [options]     Create a new Botfront project.
  up [options]       Start a Botfront project.  Must be executed in your project's directory
  down [options]     Stops a Botfront project and releases Docker resources.  Must be executed in your project's directory
  logs [options]     Display botfront logs. Must be executed in your project's directory
  killall [options]  Stops any running Botfront project
  stop [service]     Stop a Botfront service (interactive). Must be executed in your project's directory
  start [service]    Start a Botfront service (interactive). Must be executed in your project's directory
  restart [service]  Restart a Botfront service (interactive). Must be executed in your project's directory
  watch              Restart the Actions service automatically on file change. Must be executed in your project's directory
  docs               Open the online documentation in your browser
```


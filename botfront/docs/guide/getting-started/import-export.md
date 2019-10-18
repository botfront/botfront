# Import / Export

Botfront lets you export your project in 2 formats. For Botfront and Rasa / Rasa X.

## Botfront
Projects can be exported and imported in Botfront, everything will be retained. NLU, stories, branches, links, policies, config, etc. You can choose whether to export conversational data or not.

## Compatibility with Rasa / Rasa X

### Export

Botfront exports a zip file containing all the files required to inititate a Rasa X project:

```
awesome-project
|- data/
|--- nlu.md
|--- stories.md
|- config.yml
|- credentials.yml
|- domains.yml
|- endpoints.yml
```

There are a few things you need to pay attention to:

#### NLU
Consider removing Botfront specific NLU components, such as `rasa_addons.nlu.components.gazette.Gazette` and `rasa_addons.nlu.components.language_setter.LanguageSetter`

#### Credentials and endpoints
You probably don't need to change them, or if you need to keep credentials from Botfront, be sure to keep the `rasa` and `rest` fields from the `credentials.yml` provided by Rasa X.

#### Responses
Responses (templates) are lists. Rasa treats them as variants that should be randomly displayed, Botfront treats them as sequence (each item is uttered). If you used the sequence feature in Botfront, you will need to rework your stories accordingly.

### Import
An import tool will be available soon. In the meantime you need to import elements separately from the different files.
export const validBfConfig = {
    filename: 'bfconfigtest.yml',
    rawText:
    `name: My Projectaa
defaultLanguage: en
languages:
      - en

instance:
      _id: BWRbPAQEYiH5AddHW
      name: Default Instance
      host: 'http://localhost:6005'
      projectId: bf`,
    dataType: 'bfconfig',
};

export const validBfConfigParsed = {
    defaultLanguage: 'en',
    instance: {
        _id: 'BWRbPAQEYiH5AddHW',
        host: 'http://localhost:6005',
        name: 'Default Instance',
        projectId: 'bf',
    },
    languages: [
        'en',
    ],
    name: 'My Projectaa',
};

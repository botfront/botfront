const yaml = require('js-yaml');
const { body, validationResult, query } = require('express-validator/check');
const { Responses } = require('../../models/models');

const formatTemplates = templates => yaml.safeDump({
    templates: templates.reduce((ks, k) => ({
        ...ks,
        [k.key]: k.values.reduce((vs, v) => ({
            ...vs,
            [v.lang]: v.sequence.map(seq => yaml.safeLoad(seq.content)),
        }), {}),
    }), {}),
});

exports.formatTemplates = formatTemplates;

function subText(text, slots) {
    const slotSubs = Object.entries(slots).map(s => [`{${s[0]}}`, s[1] || '']);
    let subbedText = text;
    slotSubs.forEach(s => (subbedText = subbedText.replace(s[0], s[1])));
    return subbedText;
}

function formatSequence(t, templateKey, slots = {}) {
    const doc = yaml.safeLoad(t.content);
    //TODO validate against schema https://github.com/nodeca/js-yaml/
    if (typeof doc === 'object') return { ...doc, text: subText(doc.text, slots) };
    else if (typeof doc === 'string') return { text: subText(doc, slots) };
    else
        throw {
            error: 'wrong_message_format',
            code: 400,
        };
}

exports.nlgValidator = [
    // check('lang', 'must be a language code (e.g. "fr" or "en")')
    //     .isString().isLength({min: 2, max: 2}),
    // check('name', 'must start with \'utter_\'').matches(/^utter_/),
    // query('metadata', 'must be 1 or 0 if set').optional().isBoolean(),
    body('template', 'is required and must start with utter_')
        .isString()
        .custom(value => value.startsWith('utter_')),
    body(
        'arguments',
        'arguments should be an object and have a \'language\' property set to a language code',
    ).custom(value => value && value.language),
];

exports.nlg = async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { project_id: projectId } = req.params;
    const {
        template: key,
        arguments: { language },
        tracker: { slots },
    } = req.body;

    try {
        const response = await Responses.findOne({ key, projectId }).lean()
        if (!response) throw { code: 404, error: 'not_found' };
        const localizedValue = response.values.find(v => v.lang === language);
        if (!localizedValue || !localizedValue.sequence.length)
            throw {
                code: 404,
                error: 'not_found',
            };

        return res.status(200).json(
            localizedValue.sequence.map(t => formatSequence(t, key, slots)),
        );
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};
exports.getResponseByName = async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { project_id: projectId, name: key, lang } = req.params;
    try {
        const response = await Responses.findOne({ key, projectId }).lean()
        if (!response) throw { code: 404, error: 'not_found' };
        const localizedValue = response.values.find(v => v.lang === lang);
        if (!localizedValue || !localizedValue.sequence.length)
            throw {
                code: 404,
                error: 'not_found',
            };

        return res.status(200).json(
            localizedValue.sequence.map(t => {
                return formatSequence(t, key);
            }),
        );
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};

exports.allResponsesValidator = [
    query('timestamp', 'must be in milliseconds if set')
        .optional()
        .isInt(),
    query('ouput', 'json/(Rasa-compatible) yaml')
        .optional()
        .isIn(['json', 'yaml']),
];

exports.getAllResponses = async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { project_id: projectId } = req.params;
    const { output } = req.query;
    try {
        const templates = await Responses.find({ projectId }).lean();

        if (output == 'yaml') {
            return res.status(200).send(formatTemplates(templates))
        }

        return res.status(200).json({
            responses: templates,
        });
    } catch (err) {
        return res.status(err.code || 500).json(err);
    }
};

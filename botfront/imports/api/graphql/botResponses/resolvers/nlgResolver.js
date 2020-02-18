import { safeLoad } from 'js-yaml';
import { sample } from 'lodash';
import { newGetBotResponses } from '../mongo/botResponses';
import { getLanguagesFromProjectId } from '../../../../lib/utils';
import { parseContentType } from '../../../../lib/botResponse.utils';

const interpolateSlots = (text, slots) => {
    // fills in {slotname} in templates
    const slotSubs = Object.entries(slots).map(s => [`{${s[0]}}`, s[1] || '']);
    let subbedText = text;
    slotSubs.forEach(function(s) { subbedText = subbedText.replace(s[0], s[1]); });
    return subbedText;
};

const chooseTemplateSource = (responses, channel) => {
    // chooses between array of channel-specific responses, or channel-agnostic responses
    const variantsForChannel = responses.filter(r => r.channel === channel);
    const variantsWithoutChannel = responses.filter(r => !r.channel || !r.channel.length);
    return variantsForChannel.length
        ? variantsForChannel : variantsWithoutChannel.length
            ? variantsWithoutChannel : null;
};

const resolveTemplate = async ({
    template, projectId, language, slots, channel = null,
}) => {
    const responses = await newGetBotResponses({
        projectId, template, language,
    });
    const source = chooseTemplateSource(responses, channel);
    if (!source) return { text: template }; // No response found, return template name

    const { payload: rawPayload, metadata } = sample(source);
    const payload = safeLoad(rawPayload);
    if (payload.key) delete payload.key;
    if (payload.text) payload.text = interpolateSlots(payload.text, slots || {});
    return { ...payload, metadata };
};

export default {
    Query: {
        getResponse: async (_root, args) => {
            const {
                template,
                arguments: { language: specifiedLang, projectId } = {},
                tracker: { slots } = {},
                channel: { name: channel } = {},
            } = args;
            if (!projectId) throw new Error('ProjectId missing!');
            const language = specifiedLang && getLanguagesFromProjectId(projectId).includes(specifiedLang)
                ? specifiedLang
                : slots.fallback_language;
            return resolveTemplate({
                template, projectId, language, slots, channel,
            });
        },
        getResponses: async (_root, {
            projectId, templates, language,
        }) => {
            const responses = await newGetBotResponses({
                projectId,
                template: templates,
                options: { emptyAsDefault: true },
                language,
            });
            const noMatch = templates.filter(t => !responses.map(r => r.key).includes(t))
                .map(r => ({ key: r, payload: 'text: \'\'' }));
            return [...responses, ...noMatch].map(r => ({ key: r.key, ...safeLoad(r.payload) }));
        },
    },
    BotResponsePayload: {
        __resolveType: parseContentType,
        text: ({ text }) => text,
        metadata: ({ metadata }) => metadata,
    },
    QuickReplyPayload: {
        buttons: ({ buttons }) => buttons,
    },
    ImagePayload: {
        image: ({ image }) => image,
    },
    CustomPayload: {
        elements: ({ elements }) => elements,
        attachment: ({ attachment }) => attachment,
        custom: ({ custom }) => custom,
        buttons: ({ buttons }) => buttons,
        image: ({ image }) => image,
    },
    Button: {
        __resolveType: (v) => {
            if (v.type === 'postback') return 'PostbackButton';
            if (v.type === 'web_url') return 'WebUrlButton';
            return null;
        },
        title: ({ title }) => title,
        type: ({ type }) => type,
    },
    PostbackButton: {
        payload: ({ payload }) => payload,
    },
    WebUrlButton: {
        url: ({ url }) => url,
    },
};

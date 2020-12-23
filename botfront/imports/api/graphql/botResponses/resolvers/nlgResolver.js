import { safeLoad } from 'js-yaml';
import { sample } from 'lodash';
import { GraphQLScalarType } from 'graphql';
import { newGetBotResponses } from '../mongo/botResponses';
import { parseContentType } from '../../../../lib/botResponse.utils';
import commonResolvers from '../../common/commonResolver';
import { checkIfCan } from '../../../../lib/scopes';
import Projects from '../../project/project.model';

const chooseTemplateSource = (responses, channel) => {
    // chooses between array of channel-specific responses, or channel-agnostic responses
    const variantsForChannel = responses.filter(r => r.channel === channel);
    const variantsWithoutChannel = responses.filter(r => !r.channel || !r.channel.length);
    return variantsForChannel.length
        ? variantsForChannel : variantsWithoutChannel.length
            ? variantsWithoutChannel : null;
};

const resolveTemplate = async ({
    template, projectId, language, channel = null,
}) => {
    const responses = await newGetBotResponses({
        projectId, template, language,
    });
    const source = chooseTemplateSource(responses, channel);
    if (!source) return { text: template }; // No response found, return template name

    const { payload: rawPayload, metadata } = sample(source);
    const payload = safeLoad(rawPayload);
    if (payload.key) delete payload.key;
    return { ...payload, metadata };
};

export default {
    Query: {
        getResponse: async (_root, args, context) => {
            checkIfCan('responses:r', args.projectId, context.user._id);
            const {
                template,
                arguments: { language: specifiedLang, projectId } = {},
                tracker: { slots } = {},
                channel: { name: channel } = {},
            } = args;
            if (!projectId) throw new Error('ProjectId missing!');
            const { languages } = await Projects.findOne(
                { _id: projectId }, { languages: 1 },
            ).lean();
            const language = specifiedLang && languages.includes(specifiedLang)
                ? specifiedLang
                : slots.fallback_language;
            return resolveTemplate({
                template, projectId, language, channel,
            });
        },
        getResponses: async (_root, {
            projectId, templates, language,
        }, context) => {
            checkIfCan('responses:r', projectId, context.user._id);
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
    ConversationInput: new GraphQLScalarType({ ...commonResolvers.Any, name: 'ConversationInput' }),
    BotResponsePayload: {
        __resolveType: parseContentType,
        metadata: ({ metadata }) => metadata,
    },
    QuickRepliesPayload: {
        text: ({ text }) => text,
        quick_replies: template => template.quick_replies,
    },
    TextWithButtonsPayload: {
        text: ({ text }) => text,
        buttons: ({ buttons }) => buttons,
    },
    ImagePayload: {
        text: ({ text }) => text,
        image: ({ image }) => image,
    },
    CarouselPayload: {
        text: ({ text }) => text,
        elements: ({ elements }) => elements,
    },
    CustomPayload: {
        text: ({ text }) => text,
        elements: ({ elements }) => elements,
        attachment: ({ attachment }) => attachment,
        custom: ({ custom }) => custom,
        buttons: ({ buttons }) => buttons,
        quick_replies: template => template.quick_replies,
        image: ({ image }) => image,
    },
    CarouselElement: {
        title: ({ title }) => title,
        subtitle: ({ subtitle }) => subtitle,
        image_url: ({ image_url: imageUrl }) => imageUrl,
        default_action: ({ default_action: defaultAction }) => defaultAction,
        buttons: ({ buttons }) => buttons,
    },
    Button: {
        __resolveType: (v) => {
            if (v.type === 'postback') return 'PostbackButton';
            if (v.type === 'web_url') return 'WebUrlButton';
            if (v.payload) return 'PostbackButton';
            if (v.url) return 'WebUrlButton';
            return 'PostbackButton';
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

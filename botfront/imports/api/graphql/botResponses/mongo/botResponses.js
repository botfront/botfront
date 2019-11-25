import BotResponses from '../botResponses.model';

export const getBotResponses = async projectId => (BotResponses.find(
    {
        projectId,
    },
).lean());


export const getBotResponse = async key => (BotResponses.findOne(
    {
        key,
    },
).lean());

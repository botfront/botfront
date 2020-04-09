import moment from 'moment';
import ExampleUtils from '../utils/ExampleUtils';

export function generateTurns(tracker, debug) {
    const turns = [];
    let currentTurn = {
        userSays: null,
        botResponses: [],
    };
    tracker.events.forEach((event) => {
        const type = event.event;
        
        if (type === 'user' && !!event.text) {
            // The text check here is to remove the null userUttered events that are triggered by reminders
            const example = ExampleUtils.fromParseData(event.parse_data);

            if (example.text.startsWith('/')) delete example.text;

            const userSays = {
                example,
                timestamp: moment.unix(event.timestamp),
                confidence: ExampleUtils.getConfidence(event.parse_data),
            };

            if (!currentTurn.userSays && currentTurn.botResponses.length === 0) {
                // First piece of dialogue
                currentTurn = {
                    ...currentTurn,
                    userSays,
                    messageId: event.message_id,
                };
            } else {
                // Finish previous turn and init a new one
                turns.push(currentTurn);
                currentTurn = {
                    userSays,
                    botResponses: [],
                    messageId: event.message_id,
                };
            }
        } else if (type === 'bot') {
            currentTurn.botResponses.push({
                type: 'bot_data',
                text: event.text,
                data: event.data,
            });
        } else if (debug) {
            // only insert if user has uttered something
            currentTurn.botResponses.push({
                type: 'event',
                data: event,
            });
        }
    });

    if (currentTurn.userSays || currentTurn.botResponses.length !== 0) {
        turns.push(currentTurn);
    }

    return turns;
}

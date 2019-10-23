import gql from 'graphql-tag';

export const conversationLengths = gql`
    query ConversationLengths($projectId: String!, $from: Float, $to: Float) {
        conversationLengths(
            projectId: $projectId,
            from: $from,
            to: $to,
        ) {
            frequency,
            count,
            length
        }
    }
`;

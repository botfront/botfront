import gql from 'graphql-tag';

export const RESPONSE_ADDED = gql`
subscription newResponse {
    botResponseAdded {
        key
    }
}`;

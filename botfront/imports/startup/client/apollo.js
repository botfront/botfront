import { Accounts } from 'meteor/accounts-base';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';
import { onError } from 'apollo-link-error';
import { ApolloLink, Observable, split } from 'apollo-link';
import { DDPSubscriptionLink, isSubscription } from 'apollo-link-ddp';

import botResponseFragmentTypes from '../../api/graphql/botResponses/schemas/botResponseFragmentTypes.json';
import formFragmentTypes from '../../api/graphql/forms/formFragmentTypes.json';

const introspectionQueryResultData = {
    __schema: {
        types: [
            ...botResponseFragmentTypes,
            ...formFragmentTypes,
        ],
    },
};

const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData,
});

const request = async (operation) => {
    operation.setContext({
        headers: {
            // eslint-disable-next-line no-underscore-dangle
            authorization: Accounts._storedLoginToken(),
        },
    });
};

const requestLink = new ApolloLink((operation, forward) => new Observable((observer) => {
    let handle;
    Promise.resolve(operation)
        .then(oper => request(oper))
        .then(() => {
            handle = forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
            });
        })
        .catch(observer.error.bind(observer));

    return () => {
        if (handle) handle.unsubscribe();
    };
}));


const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ));
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
});


const uploadLink = createUploadLink({
    uri: '/graphql',
    credentials: 'same-origin',
});


const subscriptionLink = new DDPSubscriptionLink();

const link = split(
    isSubscription,
    subscriptionLink,
    uploadLink,
);

// this will activate the dev tools when we are testing the application
// So cypress can acces __APOLLO_CLIENT__
let devTools = {};
if (window.Cypress) {
    devTools = { connectToDevTools: true };
}

const client = new ApolloClient({
    link: ApolloLink.from([errorLink, requestLink, link]),
    cache: new InMemoryCache({ fragmentMatcher }),
    ...devTools,
});

export default client;

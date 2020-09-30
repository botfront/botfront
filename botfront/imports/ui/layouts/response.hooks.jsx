import { useState } from 'react';
import gql from 'graphql-tag';
import apolloClient from '../../startup/client/apollo';
import { GET_BOT_RESPONSES, UPSERT_BOT_RESPONSE } from './graphql';

export function useResponsesContext({ projectId, workingLanguage, projectLanguages }) {
    /*
        This is a file to hold all the response madness until it gets refactored
        into something saner.
    */

    const [responses, setResponsesState] = useState({});

    const responsesFrag = () => ({
        id: `${projectId}-${workingLanguage}`,
        fragment: gql`
                fragment C on Cached {
                    responses
                }
            `,
    });

    const getMultiLangResponsesFrag = async () => projectLanguages.map(({ value }) => ({
        id: `${projectId}-${value}`,
        fragment: gql`
                fragment C on Cached {
                    responses
                }
            `,
    }));

    const resetResponseInCache = async (responseName) => {
        const frags = await getMultiLangResponsesFrag();
        const fragKeys = Object.keys(frags);
        const readFrags = fragKeys.map(
            key => apolloClient.readFragment(frags[key]) || { responses: {} },
        );
        readFrags.forEach((frag, i) => {
            const fragResponses = { ...frag.responses };
            delete fragResponses[responseName];
            const newFrag = {
                ...frags[fragKeys[i]],
                data: {
                    responses: fragResponses,
                    __typename: 'Cached',
                },
            };
            apolloClient.writeFragment(newFrag);
        });
    };

    const readResponsesFrag = () => apolloClient.readFragment(responsesFrag()) || { responses: {} };

    const writeResponsesFrag = (incomingResponses) => {
        const newResponses = {
            ...responsesFrag(),
            data: {
                responses: incomingResponses,
                __typename: 'Cached',
            },
        };
        apolloClient.writeFragment(newResponses);
        setResponsesState(incomingResponses);
    };

    const setResponse = async (template, content) => {
        const { responses: oldResponses } = await readResponsesFrag();
        return writeResponsesFrag({ ...oldResponses, [template]: content });
    };

    const setResponses = async (data = {}) => {
        const { responses: oldResponses } = await readResponsesFrag();
        return writeResponsesFrag({ ...oldResponses, ...data });
    };

    const addResponses = async (templates) => {
        const { responses: oldResponses } = await readResponsesFrag();
        const newTemplates = templates.filter(r => !Object.keys(oldResponses).includes(r));
        if (!newTemplates.length) return setResponsesState(oldResponses);
        const result = await apolloClient.query({
            query: GET_BOT_RESPONSES,
            variables: {
                templates: newTemplates,
                projectId,
                language: workingLanguage,
            },
        });
        if (!result.data) return setResponsesState(oldResponses);
        await setResponses(
            result.data.getResponses.reduce(
                // turns [{ k: k1, v1, v2 }, { k: k2, v1, v2 }] into { k1: { v1, v2 }, k2: { v1, v2 } }
                (acc, { key, ...rest }) => ({
                    ...acc,
                    ...(key in acc ? {} : { [key]: rest }),
                }),
                {},
            ),
        );
        return Date.now();
    };

    const upsertResponse = async (key, newResponse, index) => {
        const { payload, key: newKey } = newResponse;
        const { isNew, ...newPayload } = payload; // don't pass isNew to mutation
        let responseTypeVariable = {};
        // if the response type has changed; add newResponseType to the queryVariables
        if (responses[key] && responses[key].__typename !== payload.__typename) {
            responseTypeVariable = { newResponseType: payload.__typename };
            resetResponseInCache(key);
        }
        if (newKey) resetResponseInCache(newKey);
        const variables = {
            projectId,
            language: workingLanguage,
            newPayload,
            key,
            newKey,
            index,
            ...responseTypeVariable,
        };
        const result = await apolloClient.mutate({
            mutation: UPSERT_BOT_RESPONSE,
            variables,
            update: () => setResponse(newKey || key, { isNew, ...newPayload }),
        });
        return result;
    };

    return {
        responses,
        addResponses,
        upsertResponse,
        resetResponseInCache,
        setResponseInCache: setResponse,
    };
}

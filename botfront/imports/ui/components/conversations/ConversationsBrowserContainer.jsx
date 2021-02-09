import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { browserHistory, withRouter } from 'react-router';
import { Container } from 'semantic-ui-react';
import { connect } from 'react-redux';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { GET_CONVERSATIONS } from './queries';

import { updateIncomingPath } from '../incoming/incoming.utils';
import { Projects } from '../../../api/project/project.collection';
import { applyTimezoneOffset } from '../../../lib/graphs';
import apolloClient from '../../../startup/client/apollo';
import { formatConversationsInMd } from './utils';
import { clearTypenameField } from '../../../lib/client.safe.utils';
import {
    setConversationFilters,
    setWorkingDeploymentEnvironment,
} from '../../store/actions/actions';
import { queryifyFilter } from '../../../lib/conversationFilters.utils';
import { Loading } from '../utils/Utils';
import ConversationsBrowser from './ConversationsBrowser';

const ConversationsBrowserContainer = (props) => {
    const {
        environment: env,
        router,
        setFiltersInRedux,
        filtersFromRedux,
        changeWorkingEnv,
    } = props;
    if (!router) {
        return <></>;
    }

    const projectId = router.params.project_id;
    let activeConversationId = router.params.selected_id;
    const page = parseInt(router.params.page, 10) || 1;
    const defaults = {
        lengthFilter: { compare: -1, xThan: 'greaterThan' },
        durationFilter: { compareLowerBound: -1, compareUpperBound: -1 },
        confidenceFilter: { compare: -1, xThan: 'lessThan' },
        eventFilter: [],
        startDate: moment().subtract(7, 'd').set({
            hour: 0,
            minute: 0,
            second: 0,
        }),
        endDate: moment().set({
            hour: 23,
            minute: 59,
            second: 59,
        }),
        eventFilterOperator: 'or',
        userId: null,
        env: 'development',
        userInitiatedConversations: true,
        triggeredConversations: true,
    };

    const getQueryParam = (key) => {
        const {
            location: { query },
        } = router;
        let value = query[key];
        switch (key) {
        case 'actionFilters':
        case 'eventFilter':
            value = JSON.parse(value || '[]');
            return Array.isArray(value) ? value : [value];
        case 'lengthFilter':
        case 'confidenceFilter':
        case 'durationFilter':
            try {
                return JSON.parse(value);
            } catch (e) {
                return undefined;
            }
        case 'startDate':
        case 'endDate':
            return value ? moment(value) : undefined;
        case 'userInitiatedConversations':
        case 'triggeredConversations':
            return value ? value === 'true' : undefined;
        default:
            return value;
        }
    };

    const getFilterFromQuery = (key) => {
        const filter = getQueryParam(key);
        if (!filter && filter !== false) {
            return defaults[key];
        }
        return filter;
    };


    const getInitialFilters = () => ({
        lengthFilter: getFilterFromQuery('lengthFilter'),
        confidenceFilter: getFilterFromQuery('confidenceFilter'),
        durationFilter: getFilterFromQuery('durationFilter'),
        eventFilter: getFilterFromQuery('eventFilter'),
        startDate: getFilterFromQuery('startDate'),
        endDate: getFilterFromQuery('endDate'),
        eventFilterOperator: getFilterFromQuery('eventFilterOperator'),
        userId: getFilterFromQuery('userId'),
        env: getFilterFromQuery('env'),
        userInitiatedConversations: getFilterFromQuery('userInitiatedConversations'),
        triggeredConversations: getFilterFromQuery('triggeredConversations'),
    });
    const [activeFilters, setActiveFiltersHidden] = useState(getInitialFilters());
    const [projectTimezoneOffset, setProjectTimezoneOffset] = useState(0);

    const queryVariables = useMemo(
        () => ({
            projectId,
            page,
            pageSize: 20,
            ...activeFilters,
            lengthFilter: activeFilters.lengthFilter.compare,
            durationFilterLowerBound: activeFilters.durationFilter.compareLowerBound,
            durationFilterUpperBound: activeFilters.durationFilter.compareUpperBound,
            xThanLength: activeFilters.lengthFilter.xThan,
            confidenceFilter: activeFilters.confidenceFilter.compare,
            xThanConfidence: activeFilters.confidenceFilter.xThan,
        }),
        [activeFilters, page],
    );

    const {
        loading, error, data, refetch,
    } = useQuery(GET_CONVERSATIONS, {
        variables: queryVariables,
    });

    const setActiveFilters = (...args) => {
        setActiveFiltersHidden(...args);
    };

    const updateQueryParams = (vals) => {
        const {
            location: { pathname },
        } = router;
        const queryObject = {};
        Object.keys(activeFilters).forEach((key) => {
            queryObject[key] = queryifyFilter(key, vals[key]);
        });
        router.replace({ pathname, query: queryObject });
        setFiltersInRedux(vals);
    };
    function changeFilters(vals = defaults) {
        updateQueryParams(vals);
        const newActiveFilters = {
            ...vals,
            startDate: vals.startDate
                ? applyTimezoneOffset(vals.startDate, projectTimezoneOffset)
                : null,
            endDate: vals.endDate
                ? applyTimezoneOffset(vals.endDate, projectTimezoneOffset)
                : null,
        };
        const newVariables = {
            projectId,
            page,
            pageSize: 20,
            ...newActiveFilters,
            lengthFilter: newActiveFilters.lengthFilter.compare,
            durationFilterLowerBound: newActiveFilters.durationFilter.compareLowerBound,
            durationFilterUpperBound: newActiveFilters.durationFilter.compareUpperBound,
            xThanLength: newActiveFilters.lengthFilter.xThan,
            confidenceFilter: newActiveFilters.confidenceFilter.compare,
            xThanConfidence: newActiveFilters.confidenceFilter.xThan,
        };
        setActiveFilters(newActiveFilters);
        refetch(newVariables);
    }

    useEffect(() => {
        const { timezoneOffset } = Projects.findOne(
            { _id: projectId },
            { fields: { timezoneOffset: 1 } },
        );
        setProjectTimezoneOffset(timezoneOffset || 0);
    }, [projectId]);

    useEffect(() => {
        const { timezoneOffset } = Projects.findOne(
            { _id: projectId },
            { fields: { timezoneOffset: 1 } },
        );
        setProjectTimezoneOffset(timezoneOffset || 0);
    }, [projectId]);


    // those two useEffect do different things
    // this update the query string when changing the env
    useEffect(() => changeFilters({ ...activeFilters, env }), [env]);

    // this allow to land on the right environment after clicking a link with a env
    useEffect(() => {
        changeWorkingEnv(getFilterFromQuery('env') || 'development', true);
    });

    useEffect(() => {
        changeFilters(activeFilters);
    }, [projectTimezoneOffset]);

    const handleDownloadConversations = ({ format = 'json' } = {}) => {
        apolloClient
            .query({
                query: GET_CONVERSATIONS,
                variables: {
                    ...queryVariables,
                    pageSize: -1,
                    page: 1,
                    fetchTrackers: true,
                },
            })
            .then(({ data: { conversationsPage } = {} }) => {
                if (!conversationsPage || !conversationsPage.conversations.length) { return false; }
                let blob;
                if (format === 'json') {
                    blob = new Blob(
                        [
                            JSON.stringify(
                                clearTypenameField(
                                    conversationsPage.conversations,
                                ),
                            ),
                        ],
                        { type: 'application/json;charset=utf-8' },
                    );
                }
                if (format === 'md') {
                    blob = new Blob(
                        [formatConversationsInMd(conversationsPage.conversations)],
                        { type: 'text/markdown;charset=utf-8' },
                    );
                }
                return saveAs(blob, `conversations.${format}`);
            });
    };

    const componentProps = {
        page,
        projectId,
        router,
        refetch,
        activeFilters,
        setActiveFilters,
        handleDownloadConversations,
        changeFilters,
    };

    if (activeFilters && !loading && !error) {
        const { conversations, pages } = data.conversationsPage;

        // If for some reason the conversation is not in the current page, discard it.
        if (!conversations.some(c => c._id === activeConversationId)) { activeConversationId = null; }
        if (!activeConversationId && conversations.length > 0) {
            const url = updateIncomingPath({
                ...router.params,
                tab: 'conversations',
                page: page || 1,
                selected_id: conversations[0]._id,
            }); // tab will always be conversations if set on the converesations tab
            browserHistory.replace({ pathname: url, query: router.location.query });
        } else {
            Object.assign(componentProps, {
                trackers: conversations,
                activeConversationId,
                pages,
            });
        }
    } else {
        Object.assign(componentProps, {
            projectId,
            page,
            pages: 1,
            modelId: router.params.model_id,
        });
    }

    if (
        !Object.keys(router.location.query).length
        && Object.keys(filtersFromRedux || {}).length > 0
    ) {
        // if there are no filters in the query use the filters from redux
        changeFilters(filtersFromRedux);
    }

    return (
        <Loading loading={loading}>
            <Container>
                <ConversationsBrowser {...componentProps} />
            </Container>
        </Loading>
    );
};

ConversationsBrowserContainer.propTypes = {
    router: PropTypes.object.isRequired,
    environment: PropTypes.string,
    conversationFilters: PropTypes.string,
    setFiltersInRedux: PropTypes.func.isRequired,
    filtersFromRedux: PropTypes.object,
    changeWorkingEnv: PropTypes.func.isRequired,
};

ConversationsBrowserContainer.defaultProps = {
    environment: 'development',
    filtersFromRedux: {},
    conversationFilters: '',
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    environment: state.settings.get('workingDeploymentEnvironment'),
    filtersFromRedux: state.settings.getIn(['conversationFilters']),
});

const ConversationsRouter = withRouter(ConversationsBrowserContainer);

export default connect(mapStateToProps, {
    setFiltersInRedux: setConversationFilters,
    changeWorkingEnv: setWorkingDeploymentEnvironment,
})(ConversationsRouter);

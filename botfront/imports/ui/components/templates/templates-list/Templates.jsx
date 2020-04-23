import PropTypes from 'prop-types';
import {
    Container, Icon, Menu, Dropdown,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect, useContext } from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { connect } from 'react-redux';
import { useQuery, useSubscription, useMutation } from '@apollo/react-hooks';
import { Projects } from '../../../../api/project/project.collection';
import TemplatesTable from './TemplatesTable';
import { getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import { GET_BOT_RESPONSES } from '../queries';
import { RESPONSES_MODIFIED, RESPONSES_DELETED } from './subscriptions';
import { Loading } from '../../utils/Utils';
import { Stories } from '../../../../api/story/stories.collection';
import { DELETE_BOT_RESPONSE } from '../mutations';
import { ProjectContext } from '../../../layouts/context';


class Templates extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeEditor: null, newResponse: { open: false, type: '' },
        };
    }

    setActiveEditor = (responseKey) => {
        this.setState({ activeEditor: responseKey });
    };

    renderAddResponse = () => (
        <Dropdown
            text='Add bot response'
            icon='plus'
            floating
            labeled
            button
            className='icon'
            data-cy='create-response'
        >
            <Dropdown.Menu>
                <Dropdown.Item
                    text='Text'
                    onClick={() => this.setState({ newResponse: { open: true, type: 'TextPayload' } })}
                    data-cy='add-text-response'
                />
                <Dropdown.Item
                    text='Quick replies'
                    onClick={() => this.setState({ newResponse: { open: true, type: 'QuickReplyPayload' } })}
                    data-cy='add-quickreply-response'
                />
                <Dropdown.Item
                    text='Carousel'
                    onClick={() => this.setState({ newResponse: { open: true, type: 'CarouselPayload' } })}
                    data-cy='add-carousel-response'
                />
                <Dropdown.Item
                    text='Image'
                    onClick={() => this.setState({ newResponse: { open: true, type: 'ImagePayload' } })}
                    data-cy='add-image-response'
                />
                <Dropdown.Item
                    text='Custom'
                    onClick={() => this.setState({ newResponse: { open: true, type: 'CustomPayload' } })}
                    data-cy='add-custom-response'
                />
            </Dropdown.Menu>
        </Dropdown>
    );

    renderMenu = () => (
        <Menu pointing secondary className='top-menu'>
            <Menu.Item>
                <Menu.Header as='h3'>
                    <Icon name='comment alternate' />
                    Bot responses
                </Menu.Header>
            </Menu.Item>
            <Menu.Menu position='right'>
                <Menu.Item>{this.renderAddResponse()}</Menu.Item>
            </Menu.Menu>
        </Menu>
    );

    render() {
        const { activeEditor, newResponse } = this.state;
        const {
            templates, nluLanguages, deleteBotResponse, events, loading,
        } = this.props;
        return (
            <div data-cy='responses-screen'>
                {this.renderMenu()}
                <Loading loading={loading}>
                    <Container>
                        <TemplatesTable
                            deleteBotResponse={deleteBotResponse}
                            templates={templates}
                            nluLanguages={nluLanguages}
                            activeEditor={activeEditor}
                            setActiveEditor={this.setActiveEditor}
                            newResponse={newResponse}
                            closeNewResponse={() => this.setState({ newResponse: { open: false } })}
                            events={events}
                        />
                    </Container>
                </Loading>
            </div>
        );
    }
}

Templates.propTypes = {
    templates: PropTypes.array.isRequired,
    nluLanguages: PropTypes.array.isRequired,
    deleteBotResponse: PropTypes.func.isRequired,
    events: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
};

const TemplatesContainer = ({ params, events, ready }) => {
    const [templates, setTemplates] = useState([]);

    const { insertResponse } = useContext(ProjectContext);

    const project = Projects.find(
        { _id: params.project_id },
        { fields: { nlu_models: 1 } },
    ).fetch();
    if (project.length === 0) {
        console.log('Project not found');
    }

    const {
        loading, error, data, refetch,
    } = useQuery(GET_BOT_RESPONSES, {
        variables: { projectId: params.project_id },
    });

    useEffect(() => {
        if (!loading && !error) {
            setTemplates(data.botResponses);
        }
    }, [data]);

    useEffect(() => {
        refetch();
    }, []);

    useSubscription(RESPONSES_MODIFIED, {
        variables: { projectId: params.project_id },
        onSubscriptionData: ({ subscriptionData }) => {
            if (!loading) {
                const newTemplates = [...templates];
                const resp = { ...subscriptionData.data.botResponsesModified };
                const respIdx = templates.findIndex(
                    template => (template._id === resp._id && template._id) || template.key === resp.key,
                );
                if (respIdx !== -1) {
                    newTemplates[respIdx] = resp;
                } else {
                    newTemplates.push(resp);
                }
                setTemplates(newTemplates);
            }
        },
    });

    useSubscription(RESPONSES_DELETED, {
        variables: { projectId: params.project_id },
        onSubscriptionData: ({ subscriptionData }) => {
            if (!loading) {
                const newTemplates = [...templates];
                const resp = { ...subscriptionData.data.botResponseDeleted };
                const respIdx = templates.findIndex(
                    template => template._id === resp._id || template.key === resp.key,
                );
                if (respIdx !== -1) {
                    newTemplates.splice(1, 1);
                    setTemplates(newTemplates);
                }
            }
        },
    });

    const [deleteBotResponse] = useMutation(DELETE_BOT_RESPONSE, {
        refetchQueries: [
            { query: GET_BOT_RESPONSES, variables: { projectId: params.project_id } },
        ],
    });

    return (
        <Templates
            loading={!ready && loading}
            events={events}
            templates={templates}
            deleteBotResponse={deleteBotResponse}
            projectId={params.project_id}
            nluLanguages={getNluModelLanguages(project[0].nlu_models)}
            insertResponse={insertResponse}
        />
    );
};

TemplatesContainer.propTypes = {
    params: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
    events: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
    return {
        projectId: state.settings.get('projectId'),
    };
}

const ConnectedTemplates = connect(mapStateToProps)(TemplatesContainer);

export default withTracker((props) => {
    const storiesHandler = Meteor.subscribe('stories.events', props.params.project_id);
    const events = Stories
        .find()
        .fetch()
        .map(story => story.events);
    return { ...props, events, ready: storiesHandler.ready() };
})(ConnectedTemplates);

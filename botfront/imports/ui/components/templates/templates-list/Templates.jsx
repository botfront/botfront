import PropTypes from 'prop-types';
import {
    Button, Container, Icon, Menu, Segment,
} from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { useQuery, useSubscription, useMutation } from '@apollo/react-hooks';
import { Projects } from '../../../../api/project/project.collection';
import TemplatesTable from './TemplatesTable';
import ImportExport from '../import-export/ImportExport';
import { getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';
import { GET_BOT_RESPONSES } from '../queries';
import { RESPONSES_MODIFIED, RESPONSES_DELETED } from './subscriptions';
import { DELETE_BOT_RESPONSE } from '../mutations';


class Templates extends React.Component {
    constructor(props) {
        super(props);
        this.state = { activeItem: 'content' };
    }

    handleMenuItemClick = (e, { name }) => this.setState({ activeItem: name });

    renderMenu = (projectId, activeItem, nluLanguages) => (
        <Menu pointing secondary style={{ background: '#fff' }}>
            <Menu.Item>
                <Menu.Header as='h3'>
                    <Icon name='comment alternate' />
                    Bot responses
                </Menu.Header>
            </Menu.Item>
            <Menu.Item name='content' active={activeItem === 'content'} onClick={this.handleMenuItemClick}>
                <Icon size='small' name='table' />
                Content
            </Menu.Item>
            <Menu.Item name='import-export' active={activeItem === 'import-export'} onClick={this.handleMenuItemClick}>
                <Icon size='small' name='retweet' />
                Import/Export
            </Menu.Item>
            <Menu.Menu position='right'>
                <Menu.Item>
                    <Button
                        primary
                        disabled={!nluLanguages.length}
                        content='Add bot response'
                        icon='add'
                        labelPosition='left'
                        onClick={() => browserHistory.push(`/project/${projectId}/dialogue/templates/add`)}
                        data-cy='add-bot-response'
                    />
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    );

    render() {
        const { activeItem } = this.state;
        const {
            templates, projectId, nluLanguages, deleteBotResponse,
        } = this.props;
        return (
            <div data-cy='responses-screen'>
                {this.renderMenu(projectId, activeItem, nluLanguages)}
                <Container>
                    {activeItem === 'content' && <div><TemplatesTable deleteBotResponse={deleteBotResponse} templates={templates} nluLanguages={nluLanguages} /></div>}
                    {activeItem === 'import-export' && <Segment style={{ background: '#fff' }}><ImportExport projectId={projectId} /></Segment>}
                    <br />
                </Container>
            </div>
        );
    }
}

Templates.propTypes = {
    templates: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    nluLanguages: PropTypes.array.isRequired,
    deleteBotResponse: PropTypes.func.isRequired,
};

const TemplatesContainer = ({ params }) => {
    const [templates, setTemplates] = useState([]);

    const project = Projects.find({ _id: params.project_id }, { fields: { nlu_models: 1 } }).fetch();
    if (project.length === 0) {
        console.log('Project not found');
    }

    const {
        loading, error, data, refetch,
    } = useQuery(GET_BOT_RESPONSES, { variables: { projectId: params.project_id } });

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
                const respIdx = templates.findIndex(template => template.key === resp.key);
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
                const respIdx = templates.findIndex(template => template.key === resp.key);
                if (respIdx !== -1) {
                    newTemplates.splice(1, 1);
                    setTemplates(newTemplates);
                }
            }
        },
    });

    const [deleteBotResponse] = useMutation(DELETE_BOT_RESPONSE, { refetchQueries: [{ query: GET_BOT_RESPONSES, variables: { projectId: params.project_id } }] });
    
    
    return (
        <Templates
            templates={templates}
            deleteBotResponse={deleteBotResponse}
            projectId={params.project_id}
            nluLanguages={getNluModelLanguages(project[0].nlu_models)}
        />
    );
};

TemplatesContainer.propTypes = {
    params: PropTypes.object.isRequired,
};

function mapStateToProps (state) {
    return {
        projectId: state.settings.get('projectId'),
    };
}

export default connect(mapStateToProps)(TemplatesContainer);

import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import {
    Button, Container, Icon, Menu, Segment,
} from 'semantic-ui-react';
import React from 'react';
import 'react-s-alert/dist/s-alert-default.css';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Projects } from '../../../../api/project/project.collection';
import TemplatesTable from './TemplatesTable';
import ImportExport from '../import-export/ImportExport';
import { getNluModelLanguages } from '../../../../api/nlu_model/nlu_model.utils';

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
                    />
                </Menu.Item>
            </Menu.Menu>
        </Menu>
    );

    render() {
        const { activeItem } = this.state;
        const { templates, projectId, nluLanguages } = this.props;
        return (
            <div>
                {this.renderMenu(projectId, activeItem, nluLanguages)}
                <Container>
                    {activeItem === 'content' && <div><TemplatesTable templates={templates} nluLanguages={nluLanguages} /></div>}
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
};

const TemplatesContainer = withTracker(({ params }) => {
    let templates = [];
    const project = Projects.find({ _id: params.project_id }, { fields: { templates: 1, nlu_models: 1 } }).fetch();
    if (project.length > 0) {
        templates = project[0].templates ? project[0].templates : templates;
    } else {
        console.log('Project not found');
    }
    return {
        templates,
        nluLanguages: getNluModelLanguages(project[0].nlu_models),
    };
})(Templates);

function mapStateToProps (state) {
    return {
        projectId: state.settings.get('projectId'),
    };
}

export default connect(mapStateToProps)(TemplatesContainer);
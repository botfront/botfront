import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Menu, Container, Tab } from 'semantic-ui-react';

import { Projects } from '../../../api/project/project.collection';
import { NLUModels } from '../../../api/nlu_model/nlu_model.collection';
import { getPublishedNluModelLanguages, getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import { Instances } from '../../../api/instances/instances.collection';

import ConversationsBrowser from '../conversations/ConversationsBrowser.jsx';
import Activity from '../nlu/activity/Activity';

import LanguageDropdown from '../common/LanguageDropdown';

class Incoming extends React.Component {
    constructor (props) {
        super(props);
        this.state = { selectedLanguage: 'en' };
    }

    handleLanguageChange = (value) => {
        this.setState({ selectedLanguage: value });
    }

    // renderConversationBrowser = () => {}

    renderPanes = () => {
        const panes = [
            { menuItem: 'Incoming', render: () => <Tab.Pane>Incoming data</Tab.Pane> },
            { menuItem: 'Conversations', render: () => <Tab.Pane>Conversations</Tab.Pane> },
            { menuItem: 'Out of Scope', render: () => <Tab.Pane>Out of Scope data</Tab.Pane> },
            { menuItem: 'Populate', render: () => <Tab.Pane>Populate data</Tab.Pane> },
        ];
        return panes;
    }

    render () {
        const { projectLanguages, ready, instances } = this.props;
        const { selectedLanguage } = this.state;
        console.log(instances);

        if (!ready) {
            return <div>loading</div>;
        }
        return (
            <>
                <Menu pointing secondary className='top-menu'>
                    <Menu.Item header className='top-menu-item'>
                        <LanguageDropdown
                            languageOptions={projectLanguages}
                            selectedLanguage={selectedLanguage}
                            handleLanguageChange={this.handleLanguageChange}
                        />
                    </Menu.Item>
                </Menu>
                <>
                    <Container>
                        <Tab
                            panes={this.renderPanes()}
                            menu={{ secondary: true, pointing: true }}
                        />
                    </Container>
                </>
            </>
        );
    }
}

Incoming.propTypes = {
    projectLanguages: PropTypes.array,
    // projectId: PropTypes.string,
    ready: PropTypes.bool,
    model: PropTypes.object.isRequired,
    utterances: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    intents: PropTypes.array.isRequired,
    instances: PropTypes.object.isRequired,
    linkRender: PropTypes.func.isRequired,
    outDatedUtteranceIds: PropTypes.array.isRequired,
};

Incoming.defaultProps = {
    projectLanguages: [],
    // projectId: '',
    ready: false,
};

const IncomingContainer = withTracker(({ projectId }) => {
    const project = Projects.findOne({ _id: projectId });
    const projectLanguages = getNluModelLanguages(project.nlu_models, true);
    const instances = Instances.find({ projectId }).fetch();
    const instance = instances ? instances.find(({ _id }) => _id === project.instance) : {};

    console.log(instance);
    return {
        projectLanguages,
        ready: !!projectLanguages && !!instances,
        project,
        instances,
        instance,
    };
})(Incoming);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(IncomingContainer);

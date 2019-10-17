import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Menu, Container, Tab } from 'semantic-ui-react';

import { Projects } from '../../../api/project/project.collection';
import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';
import ConversationsBrowser from '../conversations/ConversationsBrowser.jsx';

import LanguageDropdown from '../common/LanguageDropdown';

class Incoming extends React.Component {
    constructor (props) {
        super(props);
        this.state = { selectedLanguage: 'en', activeMenuItem: 'Incoming' };
    }

    handleLanguageChange = (value) => {
        this.setState({ selectedLanguage: value });
    }

    // renderConversationBrowser = () => {}

    renderPanes = () => {
        const panes = [
            { menuItem: 'Incoming', render: () => <Tab.Pane>Incoming data</Tab.Pane> },
            { menuItem: 'Conversations', render: () => <Tab.Pane as={() => <ConversationsBrowser />} /> },
            { menuItem: 'Out of Scope', render: () => <Tab.Pane>Out of Scope data</Tab.Pane> },
            { menuItem: 'Populate', render: () => <Tab.Pane>Populate data</Tab.Pane> },
        ];
        return panes;
    }

    render () {
        const { projectLanguages, ready } = this.props;
        const { selectedLanguage } = this.state;
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
                <Container>
                    <Tab
                        panes={this.renderPanes()}
                        menu={{ secondary: true, pointing: true }}
                    />
                </Container>
            </>
        );
    }
}

Incoming.propTypes = {
    projectLanguages: PropTypes.array,
    // projectId: PropTypes.string,
    ready: PropTypes.bool,
};

Incoming.defaultProps = {
    projectLanguages: [],
    // projectId: '',
    ready: false,
};

const IncomingContainer = withTracker(({ projectId }) => {
    const project = Projects.findOne({ _id: projectId });
    const projectLanguages = getNluModelLanguages(project.nlu_models, true);
    return {
        projectLanguages,
        ready: !!projectLanguages,
    };
})(Incoming);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(IncomingContainer);

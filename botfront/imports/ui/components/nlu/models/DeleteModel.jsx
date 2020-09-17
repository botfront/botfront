import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { withTracker } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import {
    Button, Confirm, Icon, Message, Tab,
} from 'semantic-ui-react';
import 'brace/mode/json';
import 'brace/theme/github';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { browserHistory } from 'react-router';
import { ProjectContext } from '../../../layouts/context';
import { wrapMeteorCallback } from '../../utils/Errors';
import { GET_EXAMPLE_COUNT } from './graphql';

class DeleteModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            backupDownloaded: false,
            confirmOpen: false,
        };
    }

    onCancel = () => {
        this.setState(this.getInitialState());
    };

    onConfirm = () => {
        const { projectId, language } = this.props;
        browserHistory.push({ pathname: `/project/${projectId}/nlu/models` });
        Meteor.call(
            'nlu.remove',
            projectId,
            language,
            wrapMeteorCallback(null, 'Model deleted!'),
        );
    };

    cannotDelete = () => {
        const { project: { defaultLanguage }, language } = this.context;
        return language === defaultLanguage;
    }

    downloadModelData = () => {
        if (window.Cypress) {
            this.setState({ backupDownloaded: true });
            return;
        }
        const { language, projectId } = this.props;
        Meteor.call(
            'rasa.getTrainingPayload',
            projectId,
            { language },
            wrapMeteorCallback((_, res) => {
                const { [language]: { data } } = res.nlu;
                const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
                const filename = `${projectId.toLowerCase()}-${language}-${moment().toISOString()}.md`;
                saveAs(blob, filename);
                this.setState({ backupDownloaded: true });
            }),
        );
    };

    renderCannotDeleteMessage = (language) => {
        if (!this.cannotDelete()) {
            return (
                <Message
                    header='Default language cannot be deleted'
                    icon='warning'
                    content={'You can\'t delete the default language, to delete this language change the default language of the project.'}
                    warning
                />
            );
        }
        return (
            <Message
                negative
                header={`All the ${language} data of your model will be deleted !`}
                icon='warning circle'
                content='Please use the button below to download a backup of your data before proceeding.'
            />
        );
    }

    static contextType = ProjectContext;

    render() {
        const { backupDownloaded, confirmOpen } = this.state;
        const { language, examples } = this.props;
        const { projectLanguages } = this.context;
        const { text: languageName } = projectLanguages.find(
            lang => lang.value === language,
        );
        return (
            <Tab.Pane>
                <Confirm
                    open={confirmOpen}
                    header={`Delete ${languageName} data from your model? (${examples} examples)`}
                    content='This cannot be undone!'
                    onCancel={this.onCancel}
                    onConfirm={this.onConfirm}
                />
                {!backupDownloaded && (
                    <div>
                        {this.renderCannotDeleteMessage(languageName)}
                        <br />
                        <Button positive onClick={this.downloadModelData} className='dowload-model-backup-button' data-cy='download-backup'>
                            <Icon name='download' />
                            Backup {languageName} data of your model
                        </Button>
                    </div>
                )}
                {backupDownloaded && <Message success icon='check circle' content='Backup downloaded' />}
                <br />
                <br />
                {this.cannotDelete() && (
                    <Button
                        className='delete-model-button'
                        type='submit'
                        onClick={() => this.setState({ confirmOpen: true })}
                        negative
                        disabled={!backupDownloaded || !this.cannotDelete()}
                    >
                        <Icon name='trash' />
                        Delete <strong>{languageName}</strong> data from your model
                    </Button>
                )}
            </Tab.Pane>
        );
    }
}

DeleteModel.propTypes = {
    examples: PropTypes.number,
    language: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
};

DeleteModel.defaultProps = {
    examples: 0,
};

const DeleteModelWithTracker = withTracker((props) => {
    const { projectId, workingLanguage: language } = props;
    const { data } = useQuery(GET_EXAMPLE_COUNT, { variables: { projectId, language } });
    const { totalLength: examples } = data?.examples?.pageInfo || {};
    return { examples, language };
})(DeleteModel);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(DeleteModelWithTracker);

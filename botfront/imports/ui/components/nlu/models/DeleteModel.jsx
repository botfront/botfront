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
        const { onDeleteModel } = this.props;
        onDeleteModel();
    };

    downloadModelData = () => {
        if (window.Cypress) {
            this.setState({ backupDownloaded: true });
            return;
        }
        const { model } = this.props;
        const { project: { _id: projectId } } = this.context;
        Meteor.call(
            'rasa.getTrainingPayload',
            projectId,
            { language: model.language },
            wrapMeteorCallback((_, res) => {
                const { data } = res.nlu;
                const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
                const filename = `${model.name.toLowerCase()}-${moment().toISOString()}.md`;
                saveAs(blob, filename);
                this.setState({ backupDownloaded: true });
            }),
        );
    };

    renderCannotDeleteMessage = (cannotDelete) => {
        const { language } = this.props;
        if (!cannotDelete) {
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
        const {
            model, cannotDelete, language, examples,
        } = this.props;
        return (
            <Tab.Pane>
                <Confirm
                    open={confirmOpen}
                    header={`Delete ${language} data from your model? (${examples} examples)`}
                    content='This cannot be undone!'
                    onCancel={this.onCancel}
                    onConfirm={this.onConfirm}
                />
                {!backupDownloaded && (
                    <div>
                        {this.renderCannotDeleteMessage(cannotDelete)}
                        <br />
                        <Button positive onClick={this.downloadModelData} className='dowload-model-backup-button' data-cy='download-backup'>
                            <Icon name='download' />
                            Backup {language} data of your model
                        </Button>
                    </div>
                )}
                {backupDownloaded && <Message success icon='check circle' content='Backup downloaded' />}
                <br />
                <br />
                {cannotDelete && (
                    <Button
                        className='delete-model-button'
                        type='submit'
                        onClick={() => this.setState({ confirmOpen: true })}
                        negative
                        disabled={!backupDownloaded || !cannotDelete}
                    >
                        <Icon name='trash' />
                        Delete <strong>{language}</strong> data from your model
                    </Button>
                )}
            </Tab.Pane>
        );
    }
}

DeleteModel.propTypes = {
    model: PropTypes.object.isRequired,
    examples: PropTypes.number.isRequired,
    onDeleteModel: PropTypes.func.isRequired,
    cannotDelete: PropTypes.bool.isRequired,
    language: PropTypes.string.isRequired,
};

const DeleteModelWithTracker = withTracker((props) => {
    const { projectId, workingLanguage: language } = props;
    const { data } = useQuery(GET_EXAMPLE_COUNT, { variables: { projectId, language } });
    const { totalLength: examples } = data?.examples?.pageInfo || {};
    return { examples };
})(DeleteModel);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    workingLanguage: state.settings.get('workingLanguage'),
});

export default connect(mapStateToProps)(DeleteModelWithTracker);

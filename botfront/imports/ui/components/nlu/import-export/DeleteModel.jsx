import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, Confirm, Icon, Message, Tab,
} from 'semantic-ui-react';
import 'brace/mode/json';
import 'brace/theme/github';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { getTrainingDataInRasaFormat } from '../../../../lib/nlu_methods';

export default class DeleteModel extends React.Component {
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
        const data = JSON.stringify(getTrainingDataInRasaFormat(model, true, []), null, 2);
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        const filename = `${model.name.toLowerCase()}-${moment().toISOString()}.json`;
        saveAs(blob, filename);
        this.setState({ backupDownloaded: true });
    };

    render() {
        const { backupDownloaded, confirmOpen } = this.state;
        const { model, cannotDelete } = this.props;
        return (
            <Tab.Pane>
                <Confirm
                    open={confirmOpen}
                    header={`Delete model ${model.name}? (${model.training_data.common_examples.length} examples)`}
                    content='This cannot be undone!'
                    onCancel={this.onCancel}
                    onConfirm={this.onConfirm}
                />
                {!backupDownloaded && (
                    <div>
                        <Message
                            negative
                            header="All your model's data will be deleted!"
                            icon='warning circle'
                            content='Please use the button below to download a backup of your data before proceeding.'
                        />
                        <br />
                        <Button positive onClick={this.downloadModelData} className='dowload-model-backup-button'>
                            <Icon name='download' />
                            Backup Model Data
                        </Button>
                    </div>
                )}
                {backupDownloaded && <Message success icon='check circle' content='Backup downloaded' />}
                <br />
                <br />
                <Button
                    className='delete-model-button'
                    type='submit'
                    onClick={() => this.setState({ confirmOpen: true })}
                    negative
                    disabled={!backupDownloaded || !cannotDelete}
                >
                    <Icon name='trash' />
                    Delete model <strong>{model.name}</strong>
                </Button>
            </Tab.Pane>
        );
    }
}

DeleteModel.propTypes = {
    model: PropTypes.object.isRequired,
    onDeleteModel: PropTypes.func.isRequired,
    cannotDelete: PropTypes.bool.isRequired,
};

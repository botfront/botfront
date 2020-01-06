import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Confirm, Dropdown, Button, Icon,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { can } from '../../../../api/roles/roles';

const confirmations = {
    ADD_TO_TRAINING: 'The selected utterances will be added to the training data',
    EVALUATE: 'This will evaluate the model using the selected examples as a validation set and overwrite your current evaluation results.',
    DELETE: 'The selected utterances will be deleted. You might want to do that if you observe that utterances with high score are generally correct. '
        + 'It means your model doesn\'t have much more to learn from these type of examples so you don\'t need to add them to your training data.',
    INVALIDATE: 'The selected utterances will be marked invalidated.',
};

const actionOptions = [
    { text: 'Add to training data', key: 'ADD_TO_TRAINING' },
    { text: 'Delete', key: 'DELETE' },
    { text: 'Run evaluation', key: 'EVALUATE' },
    { text: 'Invalidate', key: 'INVALIDATE' },
];

function ActivityActions(props) {
    const [selectedAction, setSelectedAction] = useState(null);
    const {
        numValidated, onInvalidate, onAddToTraining, onDelete, onEvaluate, projectId,
    } = props;

    const executeAction = (action) => {
        switch (action) {
        case 'INVALIDATE': onInvalidate(); break;
        case 'EVALUATE': onEvaluate(); break;
        case 'ADD_TO_TRAINING': onAddToTraining(); break;
        case 'DELETE': onDelete(); break;
        default: break;
        }
        setSelectedAction(null);
    };

    if (!can('nlu-data:w', projectId)) return null;
    return (
        <div>
            <Confirm
                open={!!selectedAction}
                header='Please confirm'
                content={confirmations[selectedAction]}
                onCancel={() => setSelectedAction(null)}
                onConfirm={() => executeAction(selectedAction)}
            />
            <Dropdown
                trigger={(
                    <Button
                        className='white'
                        color='green'
                        size='small'
                        basic
                        icon
                        labelPosition='left'
                        data-cy='process-in-bulk'
                    >
                        <Icon name='angle double right' />{`Process ${numValidated > 0 ? numValidated : ''} validated utterance${numValidated === 1 ? '' : 's'}`}
                    </Button>
                )}
                disabled={!numValidated}
                onChange={(e, { value }) => setSelectedAction(value)}
                className='dropdown-button-trigger'
                data-cy='choose-action-dropdown'
            >
                <Dropdown.Menu>
                    {actionOptions.map(o => <Dropdown.Item {...o} onClick={() => setSelectedAction(o.key)} />)}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

ActivityActions.propTypes = {
    onInvalidate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEvaluate: PropTypes.func.isRequired,
    onAddToTraining: PropTypes.func.isRequired,
    numValidated: PropTypes.number.isRequired,
    projectId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ActivityActions);

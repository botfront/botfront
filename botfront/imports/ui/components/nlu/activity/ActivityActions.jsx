import React from 'react';
import PropTypes from 'prop-types';
import { Confirm, Dropdown, Button, Icon } from 'semantic-ui-react';

const confirmations = {
    ADD_TO_TRAINING: 'The selected utterances will be added to the training data',
    EVAL: 'This will evaluate the model using the selected examples as a validation set and overwrite your current evaluation results.',
    DELETE: 'The selected utterances will be deleted. You might want to do that if you observe that utterances with high score are generally correct. '
        + 'It means your model doesn\'t have much more to learn from these type of examples so you don\'t need to add them to your training data.',
    DELETE_ALL: 'All utterances will be permanently deleted',
    VALIDATE: 'The selected utterances will be marked validated.',
    INVALIDATE: 'The selected utterances will be marked invalidated.',
};

export default class ActivityActions extends React.Component {
    static getFailingEntities = (entities, score) => entities.filter(entity => entity.extractor === 'ner_crf'
        && (!entity.confidence || entity.confidence < score)); // TODO remove when

    static getExamplesFilterByConfidence = (examples, score) => examples.filter((example) => {
        // TODO remove this soon, this is a temp fix for projects that have intents with score 0.0
        if (!example.confidence) example = { ...example, confidence: 1.0 };
        //
        const entitiesFailing = ActivityActions.getFailingEntities(example.entities, score);
        return entitiesFailing.length === 0 && example.confidence >= score;
    });

    constructor(props) {
        super(props);
        this.state = this.getDefaultState();
    }

    getDefaultState = () => ({
        dataFilter: null,
        action: null,
        actionOptions: [],
        confirmation: null,
        confirmOpen: false,
    });

    getConfirmation = value => confirmations[value];

    handleDataChanged = (e, { value }) => {
        const { onFilterChange } = this.props;
        const filterFns = {
            VALIDATED: examples => examples.filter(example => example.validated),
//            ALL: examples => ActivityActions.getExamplesFilterByConfidence(examples, 0),
        };
        onFilterChange(filterFns[value]);
        this.setState({ dataFilter: value, action: null, actionOptions: this.getActionsOptions(value) });
    };

    handleActionChanged = (e, { value }) => this.setState({ action: value, confirmation: this.getConfirmation(value) });

    getFilterOptions = () => {
        const options = [];
        const { numValidated } = this.props;
        if (numValidated > 0) options.push({ text: `Process ${numValidated} validated utterance${numValidated === 1 ? '' : 's'}`, value: 'VALIDATED' });
//        options.push({ text: 'All utterances', value: 'ALL' });
        return options;
    };

    getActionsOptions = (dataFilter) => {
        if (dataFilter === 'VALIDATED') {
            return [
                { text: 'Add to training data', value: 'ADD_TO_TRAINING', key: 'ADD_TO_TRAINING' },
                { text: 'Run evaluation', value: 'EVALUATE', key: 'EVALUATE' },
                { text: 'Invalidate', value: 'INVALIDATE', key: 'INVALIDATE' },
            ];
        }

        if (dataFilter === 'ALL') {
            return [
                { text: 'Delete All', value: 'DELETE_ALL', key: 'DELETE_ALL' },
            ];
        }
        return null;
    };

    handleChangeOrAddIntent = (e, { value }) => this.setState({ intent: value });

    resetState = () => this.setState(this.getDefaultState());

    finish = () => {
        const { onDone } = this.props;
        this.resetState();
        onDone();
    };

    executeAction = () => {
        const { action, intent } = this.state;
        const {
            onValidate, onAddToTraining, onDelete, onEvaluate, onSetIntent,
        } = this.props;
        switch (action) {
        case 'VALIDATE': onValidate(); break;
        case 'INVALIDATE': onValidate(); break;
        case 'EVALUATE': onEvaluate(); break;
        case 'ADD_TO_TRAINING': onAddToTraining(); break;
        case 'DELETE': onDelete(); break;
        case 'DELETE_ALL': onDelete(); break;
        default: break;
        }
        this.finish();
    };

    render() {
        const {
            dataFilter, actionOptions, action, confirmOpen, confirmation, intent,
        } = this.state;
        const { intents, numValidated } = this.props;
        const options = intents.map(i => ({ text: i, value: i }));
        const noBorder = { border: 0 };
        return (
            <div>
                <Confirm
                    open={confirmOpen}
                    header='Please confirm'
                    content={confirmation}
                    onCancel={() => { this.resetState(); }}
                    onConfirm={() => { this.executeAction(); }}
                />
                <Button
                    disabled={!numValidated}
                    className='icon'
                    color='green'
                    size='small'
                    basic
                    icon
                    labelPosition='left'
                    onClick={e => this.handleDataChanged(e, { value: 'VALIDATED' })}
                >
                    <Icon name='angle double right' /> {`Process ${numValidated > 0 ? numValidated : ''} validated utterance${numValidated === 1 ? '' : 's'}`}
                </Button>
                &nbsp;
                &nbsp;
                {dataFilter && (
                    <Button.Group size='small' color='yellow' basic style={noBorder}>
                        <Dropdown
                            button
                            className='icon'
                            icon='angle double right'
                            floating
                            labeled
                            placeholder='Choose Action'
                            value={action}
                            options={actionOptions}
                            onChange={this.handleActionChanged}
                        />
                    </Button.Group>
                )
                }

                &nbsp;
                &nbsp;
                {dataFilter && (
                    <Button.Group size='small'>
                        {action && <Button icon='check' content='confirm' color='green' onClick={() => this.setState({ confirmOpen: true })} />}
                        <Button icon='remove' basic content='Cancel' onClick={() => this.finish()} />
                    </Button.Group>
                )
                }
            </div>
        );
    }
}

ActivityActions.propTypes = {
    onValidate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEvaluate: PropTypes.func.isRequired,
    onAddToTraining: PropTypes.func.isRequired,
    numValidated: PropTypes.number.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
    intents: PropTypes.array.isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dropdown,
    Icon,
    Form,
    Segment,
    Label,
    Grid,
} from 'semantic-ui-react';
import {
    find, remove, cloneDeep, sortBy,
} from 'lodash';

import getColor from '../../../lib/getColors';
import NLUExampleTester from './NLUExampleTester';
import { ExampleTextEditor } from './ExampleTextEditor';
import { examplePropType } from '../utils/ExampleUtils';

const styleEditMode = {
    backgroundColor: 'rgb(247, 247, 247)',
};

const labelStyle = { borderRadius: '0.15rem' };
export default class NLUExampleEditMode extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        if (this.props.example && !this.props.example.entities) this.props.example.entities = [];
        this.state = this.getInitialState();
    }

    getInitialState() {
        // TODO the line below fixes a bug where the table content is updated when the example state changes. This is probably not the right fix and hides a mem leak somewhere
        const example = cloneDeep(this.props.example);
        if (example && !example.intent) example.intent = this.props.defaultIntent;
        return {
            example: example || this.getEmptyExample(),
            text: example ? example.text : '',
            intents: this.getIntents(),
            intent: example ? example.intent : null,
            entities: this.props.entities ? sortBy(this.props.entities, 'start') : [],
            saveDisabled: this.shouldDisableSaveButton(),
            saving: false,
        };
    }

    getEmptyExample() {
        return { text: '', intent: '', entities: [] };
    }

    getIntents() {
        const { intents, defaultIntent } = this.props;
        if (this.props.example && this.props.example.intent_ranking && this.props.example.intent_ranking.length > 0) {
            return this.props.example.intent_ranking.map(e => ({
                text: `${e.name} (${(e.confidence * 100).toFixed(0)}%)`,
                value: e.name,
            }));
        }
        const intentList = [...(intents || [])];
        if (defaultIntent && !intentList.some(({ value }) => value === defaultIntent)) intentList.push({ text: defaultIntent, value: defaultIntent });
        return intentList;
    }

    shouldDisableSaveButton() {
        return false;
    }


    onTextChanged(example) {
        this.setState({ example });
    }

    handleChangeOrAddIntent = (e, { value }) => {
        this.state.example.intent = value;
        if (this.state.intents.map(i => i.text).indexOf(value) === -1) {
            this.state.intents = [{ text: value, value }, ...this.state.intents];
        }
        this.setState({
            intents: this.state.intents,
            example: this.state.example,
            saveDisabled: this.shouldDisableSaveButton(),
        });
    };

    handleChangeOrAddEntity = (e, { entity, value }) => {
        // field 'name' is the entity value here (see renderEntities() )
        find(this.state.example.entities, entity).entity = value;
        // If new entity, add it to the list of dropdown entities
        if (this.state.entities.indexOf(value) === -1) {
            this.state.entities = [value, ...this.state.entities];
        }

        this.setState({
            entities: sortBy(this.state.entities, 'start'),
            example: this.state.example,
        });
    };

    onSaveExample() {
        this.setState({ saving: true });
        // only save ner_crf entities

        this.props.onSave(JSON.parse(JSON.stringify(this.state.example)), (err, result) => {
            this.setState({ saving: false });
            if (this.props.postSaveAction === 'close') {
                this.onCancel();
            } else if (this.props.postSaveAction === 'clear') {
                this.setState(this.getInitialState());
            }
        }); // saving a deep copy because the example will be reset
    }

    filterNonEditableEntities() {
        return sortBy(this.state.example.entities.filter(e => e.extractor == null || e.extractor === 'ner_crf'), 'start');
    }

    onDeleteExample() {
        this.props.onDelete(this.props.example._id);
    }

    onCancel = event => this.setState({ example: this.getInitialState().example }, () => this.props.onCancel(this.props.example._id));

    deleteEntity = (event, { entity }) => {
        remove(this.state.example.entities, entity);
        this.setState({
            example: this.state.example,
        });
    };
    

    renterIntentDropDown() {
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column width={4}>
                        <Button.Group fluid size='mini' color='purple'>
                            <Dropdown
                                className='icon'
                                icon='tag'
                                name='intent'
                                button
                                placeholder='Select an intent'
                                labeled
                                search
                                value={this.state.example && this.state.example.intent}
                                allowAdditions
                                selection
                                additionLabel='Create intent: '
                                onAddItem={this.handleChangeOrAddIntent}
                                onChange={this.handleChangeOrAddIntent}
                                data-cy='intent-dropdown'
                                options={this.state.intents}
                            />
                        </Button.Group>
                    </Grid.Column>
                    <Grid.Column
                        width={10}
                    >
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }

    renderEntities() {
        if (this.state.example && this.state.example.entities) {
            const entityNames = sortBy(this.state.example.entities, 'start').map(e => e.entity);
            // exclude entities not extracted by ner_crf
            return this.filterNonEditableEntities().map((e, index) => (
                <div className='entities-viewer' key={index}><Button.Group size='mini' color={getColor(e.entity, true)}>
                    <Dropdown
                        searchInput={{ autoFocus: !e.entity }}
                        openOnFocus
                        icon='code'
                        button
                        labeled
                        className='icon'
                        entity={e}
                        placeholder='Select or add entity '
                        search
                        value={e.entity}
                        allowAdditions
                        selection
                        additionLabel='Add entity: '
                        onAddItem={this.handleChangeOrAddEntity}
                        onChange={this.handleChangeOrAddEntity}
                        options={this.state.entities.map(e => ({ text: e, value: e }))}
                    /><Button basic entity={e} icon='delete' onClick={this.deleteEntity} />
                                                             </Button.Group>
                </div>
            ));
        }
        return <div />;
    }

    renderIntentLabel() {
        const colors = {
            disambiguated: 'orange',
            failed: 'red',
        };
        if (this.state.example && Object.keys(colors).includes(this.state.example.status)) {
            return (
                <div><Label
                    color={colors[this.state.example.status]}
                    style={labelStyle}
                    ribbon
                >{this.state.example.status}
                     </Label><br /><br />
                </div>
            );
        }
    }

    hasEntities = () => this.state.example && this.state.example.entities && this.state.example.entities.filter(e => e.extractor == null || e.extractor === 'ner_crf').length > 0;

    renderButtons() {
        return (
            <Button.Group size='mini' floated='right'>
                <Button
                    loading={this.state.saving}
                    color='green'
                    type='button'
                    disabled={this.state.saveDisabled || this.state.saving}
                    onClick={this.onSaveExample.bind(this)}
                ><Icon
                    name='check'
                        name='check'
                        name='check'
                    />Save
                </Button>
                {this.props.onDelete && (
                    <Button
                        color='red'
                        type='button'
                        disabled={this.state.saving}
                        onClick={this.onDeleteExample.bind(this)}
                    ><Icon name='trash' />
                    </Button>
                )}
            </Button.Group>
        );
    }

    handleExampleTested = (example) => {
        this.setState({ example });
    };

    render() {
        const styleTextArea = {
            marginBottom: '10px',
        };
        return (
            <Segment
                className='example-editor'
                clearing
                style={styleEditMode}
                data-cy='nlu-example-edit-mode'
            >

                {this.props.onCancel
                && (
                    <Label
                        attached='top right'
                        content='&nbsp;close'
                        as='a'
                        icon='close'
                        size='mini'
                        onClick={this.onCancel}
                        onClick={this.onCancel}
                        onClick={this.onCancel}
                        onClick={this.onCancel}
                        onClick={this.onCancel}
                        onClick={this.onCancel}
                        onClick={this.onCancel}
                    />
                )}
                {this.renderIntentLabel()}
                <Form>
                    <ExampleTextEditor
                        style={styleTextArea}
                        example={this.state.example}
                        onChange={this.onTextChanged.bind(this)}
                    />

                    {this.props.testMode && (
                        <NLUExampleTester
                            text={this.state.example.text}
                            projectId={this.props.projectId}
                            entities={this.props.entities}
                            onDone={this.handleExampleTested}
                        />
                    )}
                    <br />
                    <Label size='medium' basic pointing='below' color='purple' style={labelStyle}>Intent</Label>
                    <br />
                    {this.renterIntentDropDown()} <br /> {!this.hasEntities() && this.renderButtons() }
                    <br />
                    {this.hasEntities()
                    && (
                        <div><Label size='medium' basic pointing='below' color='pink' style={labelStyle}>Entities</Label>
                            <div>{this.renderEntities()}</div><div className='example_edit_save'>{this.hasEntities() && this.renderButtons()}</div>
                        </div>
                    )
                    }

                </Form>
            </Segment>
        );
    }
}

NLUExampleEditMode.propTypes = {
    example: PropTypes.shape(examplePropType),
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onCancel: PropTypes.func,
    postSaveAction: PropTypes.string,
    saveButtonLabel: PropTypes.string,
    testMode: PropTypes.bool,
    projectId: PropTypes.string,
    defaultIntent: PropTypes.string,
};

NLUExampleEditMode.defaultProps = {
    defaultIntent: '',
};

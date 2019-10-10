import {
    Label, Popup, Grid, Button, Icon, Modal, Header,
} from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React from 'react';
import { wrapMeteorCallback } from '../../utils/Errors';

import IntentDropdown from '../common/IntentDropdown';
import IntentEditor from './IntentEditor';
import { examplePropType } from '../../utils/ExampleUtils';

class IntentNameEditor extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        const { intent } = this.props;
        this.intentDiv = React.createRef();
        this.popup = React.createRef();
        this.firstModal = React.createRef();

        this.state = {
            rename: false,
            newRenameIntent: intent,
            confirmOpen: false,
        };
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentDidUpdate(prevProps) {
        const { intent } = this.props;
        if (prevProps.intent !== intent) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ newRenameIntent: intent });
        }
    }

    componentWillUnmount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        clearTimeout(this.mouseLeaveTimer);
    }

    onNewName = (newRenameIntent) => {
        const { intent } = this.props;
        this.setState({
            rename: false,
            confirmOpen: intent !== newRenameIntent,
            newRenameIntent,
        });
    };

    onCancel = () => {
        this.setState({ confirmOpen: false });
    };

    handleClickOutside = (event) => {
        const { intent } = this.props;
        if (
            this.intentDiv.current
            && !this.intentDiv.current.contains(event.target)
            && (!this.popup.current || !this.popup.current.contains(event.target))
            && (!this.firstModal.current
                || (this.firstModal.current.contains && !this.firstModal.current.contains(event.target)))
        ) {
            this.setState({
                rename: false,
                newRenameIntent: intent,
                hovering: false,
            });
        }
    };

    onConfirm = (renameBotResponse = false) => {
        const { newRenameIntent } = this.state;
        const { onRenameIntent, intent } = this.props;
        onRenameIntent(intent, newRenameIntent, renameBotResponse);
        this.setState({
            confirmOpen: false,
            newRenameIntent,
            hovering: false,
        });
    };

    handleChangeOrAddIntent = (e, { value }) => {
        const { example, onSave } = this.props;
        onSave(
            {
                ...example,
                intent: value,
            },
            () => {},
        );
    };

    handleMouseEnter = () => {
        clearTimeout(this.mouseLeaveTimer);
        this.setState({ hovering: true });
    };

    handleMouseLeave = () => {
        this.mouseLeaveTimer = setTimeout(() => {
            // this lets the user time to put his mouse on the popup after leaving the label
            this.setState({ hovering: false });
        }, 50);
    };

    handlePencilClick = () => {
        const { projectId, intent } = this.props;

        this.setState({ rename: true });

        // We call this when we start renaming so that when the rename confirmation popup appears
        // The state alreay knows if it has to ask for confirmation to rename corresponding templates.
        Meteor.call(
            'templates.countWithIntent',
            projectId,
            intent,
            wrapMeteorCallback((err, res) => {
                this.setState({ templatesMatchIntent: res });
            }),
        );
    };

    handleXClick = (e) => {
        this.handleChangeOrAddIntent(e, { value: null });
    };

    getExamplesCount = () => this.props.examples.filter(e => e.intent === this.props.intent).length;

    renderRenameTemplatesModal() {
        const { intent } = this.props;
        return (
            <Modal trigger={<Button primary> OK </Button>} data-cy='rename-responses-confirm-modal'>
                <Header content='Update NLU criteria in bot responses?' />
                <Modal.Content>{`Update bot responses matching ${intent}`}</Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => this.onConfirm()}>No</Button>
                    <Button primary onClick={() => this.onConfirm(true)}>Yes</Button>
                </Modal.Actions>
            </Modal>
        );
    }

    renderViewer() {
        const { intents, intent } = this.props;
        const { hovering, confirmOpen } = this.state;
        const style = {
            borderRadius: '4px',
            cursor: 'default',
        };
        const trigger = intent ? (
            <Label color='purple' style={style} data-cy='nlu-table-intent'>
                {intent}
            </Label>
        ) : (
            <Label color='grey' style={style} basic>
                -
            </Label>
        );
        return (
            <Popup
                content={(
                    <div ref={this.popup} data-cy='intent-popup'>
                        <Grid>
                            <Grid.Row
                                style={{
                                    padding: '0.7em 0.7em 0.8em 0.7em',
                                }}
                            >
                                <IntentDropdown
                                    intent={intent}
                                    options={[...intents, { text: intent, value: intent }]}
                                    onChange={this.handleChangeOrAddIntent}
                                    onAddItem={this.handleChangeOrAddIntent}
                                />
                            </Grid.Row>
                        </Grid>
                    </div>
                )}
                trigger={trigger}
                hoverable
                position='top center'
                // if we don't check confirmOpen then the popup appears on top of the confirm modal
                open={(hovering && !confirmOpen)}
            />
        );
    }

    render() {
        const {
            rename,
            newRenameIntent,
            confirmOpen,
            hovering,
            templatesMatchIntent,
        } = this.state;
        const {
            onRenameIntent,
            intent,
            enableRenaming,
            enableReset,
        } = this.props;
        const iconStyle = {
            padding: '5px 0 0 5px',
        };
        return (
            <div
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                ref={this.intentDiv}
            >
                <Modal open={confirmOpen} ref={this.firstModal} data-cy='rename-intent-confirm-modal'>
                    <Header
                        content={`Rename intent ${intent} to ${newRenameIntent}? (${this.getExamplesCount()} examples)`}
                    />
                    <Modal.Content>This cannot be undone!</Modal.Content>
                    <Modal.Actions>
                        <Button
                            disabled={templatesMatchIntent === undefined}
                            onClick={() => this.setState({ confirmOpen: false })}
                        >
                            Cancel
                        </Button>
                        {templatesMatchIntent ? (
                            this.renderRenameTemplatesModal()
                        ) : (
                            <Button
                                primary
                                disabled={templatesMatchIntent === undefined}
                                onClick={() => this.onConfirm()}
                            >
                                OK
                            </Button>
                        )}
                    </Modal.Actions>
                </Modal>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {!rename && this.renderViewer()}
                    {rename && (
                        <IntentEditor
                            intent={intent}
                            onRenameIntent={onRenameIntent}
                            onNewName={this.onNewName}
                        />
                    )}
                    {enableReset && intent && (
                        <div style={{ width: '20px' }}>
                            {hovering && (
                                <Icon
                                    data-cy='rename-intent'
                                    name='x'
                                    style={iconStyle}
                                    color='grey'
                                    link
                                    onClick={this.handleXClick}
                                />
                            )}
                        </div>
                    )}
                    {enableRenaming && !rename && (
                        <div style={{ width: '20px' }}>
                            {hovering && (
                                <Icon
                                    data-cy='rename-intent'
                                    name='pencil'
                                    style={iconStyle}
                                    color='grey'
                                    link
                                    onClick={this.handlePencilClick}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

IntentNameEditor.propTypes = {
    intent: PropTypes.string.isRequired,
    onRenameIntent: PropTypes.func,
    examples: PropTypes.array,
    intents: PropTypes.array.isRequired,
    example: PropTypes.shape(examplePropType).isRequired,
    onSave: PropTypes.func.isRequired,
    enableRenaming: PropTypes.bool,
    enableReset: PropTypes.bool,
    projectId: PropTypes.string.isRequired,
};

IntentNameEditor.defaultProps = {
    onRenameIntent: () => {},
    enableRenaming: false,
    enableReset: false,
    examples: [],
};

export default IntentNameEditor;

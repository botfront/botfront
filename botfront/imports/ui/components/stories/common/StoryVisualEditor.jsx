import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'semantic-ui-react';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import BotResponsesContainer from './BotResponsesContainer';
import AddStoryLine from './AddStoryLine';
import { ConversationOptionsContext } from '../../utils/Context';

class StoryVisualEditor extends React.Component {
    state = {
        lineInsertIndex: null,
    }

    addStoryCursor = React.createRef();

    componentDidUpdate(prevProps, prevState) {
        const { lineInsertIndex } = this.state;
        if ((lineInsertIndex || lineInsertIndex === 0) && lineInsertIndex !== prevState.lineInsertIndex) {
            this.addStoryCursor.current.focus();
        }
    }

    handleDeleteLine = (i) => {
        const { story, updateStory } = this.props;
        updateStory([...story.slice(0, i), ...story.slice(i + 1)]);
    }

    handleDeleteResponse = (name, j) => {
        const { updateResponses } = this.props;
        const { responses } = this.context;
        const i = responses.map(r => r.name).indexOf(name);
        const newResponses = [
            ...responses.slice(0, i),
            {
                name: responses[i].name,
                data: [...responses[i].data.slice(0, j), ...responses[i].data.slice(j + 1)],
            },
            ...responses.slice(i + 1),
        ];
        updateResponses(newResponses);
    };

    handleChangeUserUtterance = (i, v) => {
        const { story, updateStory } = this.props;
        const updatedLine = {
            type: 'user',
            data: [v],
        };
        updateStory([...story.slice(0, i), updatedLine, ...story.slice(i + 1)]);
    }

    handleNewUserUtterance = (i, v) => {
        const { story, updateStory } = this.props;
        const updatedLine = {
            type: 'user',
            data: [this.parseUtterance(v)],
        };
        updateStory([...story.slice(0, i), updatedLine, ...story.slice(i + 1)]);
    }

    handleCreateUtterance = (i, pl) => {
        this.setState({ lineInsertIndex: null });
        const { story, updateStory } = this.props;
        const newLine = {
            type: 'user',
            data: [pl || null],
        };
        updateStory([...story.slice(0, i + 1), newLine, ...story.slice(i + 1)]);
    }

    handleCreateSlotOrAction = (i, data) => {
        this.setState({ lineInsertIndex: null });
        const { story, updateStory } = this.props;
        updateStory([...story.slice(0, i + 1), data, ...story.slice(i + 1)]);
    }

    handleCreateSequence = (i, template) => {
        this.setState({ lineInsertIndex: null });
        const { story, updateStory, updateResponses } = this.props;
        const { responses } = this.context;
        const name = this.findResponseName();
        const newResponse = {
            name,
            data: [template],
        };
        updateResponses(responses.concat([newResponse]));
        const newLine = {
            type: 'bot',
            data: { name },
        };
        updateStory([...story.slice(0, i + 1), newLine, ...story.slice(i + 1)]);
    }

    handleCreateResponse = (name, j, template) => {
        const { updateResponses } = this.props;
        const { responses } = this.context;
        const i = responses.map(r => r.name).indexOf(name);
        const newResponses = [
            ...responses.slice(0, i),
            {
                name: responses[i].name,
                data: [...responses[i].data.slice(0, j + 1), template, ...responses[i].data.slice(j + 1)],
            },
            ...responses.slice(i + 1),
        ];
        updateResponses(newResponses);
    }

    parseUtterance = u => ({
        text: u,
        intent: 'dummdummIntent',
    });

    findResponseName = () => {
        const { responses } = this.context;
        const unnamedResponses = responses
            .map(r => r.name)
            .filter(r => r.indexOf('newResponse') === 0);
        return `newResponse${unnamedResponses.length + 1}`;
    }

    renderOtherLine = (i, l) => (
        <React.Fragment key={i + l.data.name}>
            <div
                className='utterance-container'
                agent={l.type}
            >
                <div className='inner'>
                    <Label color={l.type === 'action' ? 'pink' : 'orange'}>
                        {l.type}: {l.data.name}
                        {Object.keys(l.data).filter(k => k !== 'name')
                            .map(k => <span key={l.data.name + k}>, {k}: {l.data[k]} </span>)
                        }
                    </Label>
                </div>
                <FloatingIconButton
                    icon='trash'
                    onClick={() => this.handleDeleteLine(i)}
                />
            </div>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    newLineOptions = () => ({
        userUtterance: true, botUtterance: true, action: true, slot: true,
    });

    renderAddLine = (i) => {
        const { lineInsertIndex } = this.state;
        const options = this.newLineOptions(i);

        if (!Object.keys(options).length) return null;
        if (lineInsertIndex === i) {
            return (
                <AddStoryLine
                    ref={this.addStoryCursor}
                    availableActions={options}
                    onCreateUtteranceFromInput={() => this.handleCreateUtterance(i)}
                    onCreateUtteranceFromPayload={pl => this.handleCreateUtterance(i, pl)}
                    onSelectResponse={() => {}} // not needed for now since disableExisting is on
                    onCreateResponse={template => this.handleCreateSequence(i, template)}
                    onSelectAction={action => this.handleCreateSlotOrAction(i, { type: 'action', data: { name: action } })}
                    onSelectSlot={slot => this.handleCreateSlotOrAction(i, { type: 'slot', data: slot })}
                    onBlur={({ relatedTarget }) => {
                        const modals = Array.from(document.querySelectorAll('.modal'));
                        const popups = Array.from(document.querySelectorAll('.popup'));
                        if (!(
                            this.addStoryCursor.current.contains(relatedTarget)
                            || modals.some(m => m.contains(relatedTarget))
                            || popups.some(m => m.contains(relatedTarget)) || (relatedTarget && relatedTarget.tagName === 'INPUT')
                        )) { this.setState({ lineInsertIndex: null }); }
                    }}
                />
            );
        }
        return (
            <FloatingIconButton icon='ellipsis horizontal' size='medium' onClick={() => this.setState({ lineInsertIndex: i })} />
        );
    };

    render() {
        const { story } = this.props;
        const lines = story.map((l, i) => {
            if (!['bot', 'user'].includes(l.type)) return this.renderOtherLine(i, l); // placeholder for slots and actions
            if (l.type === 'bot') {
                return (
                    <React.Fragment key={i + l.data.name}>
                        <BotResponsesContainer
                            name={l.data.name}
                            onDeleteAllResponses={() => this.handleDeleteLine(i)}
                            onDeleteResponse={j => this.handleDeleteResponse(l.data.name, j)}
                            onCreateResponse={(j, template) => this.handleCreateResponse(l.data.name, j, template)}
                        />
                        {this.renderAddLine(i)}
                    </React.Fragment>
                );
            }
            return (
                <React.Fragment key={i + (l.data[0] ? l.data[0].intent : '')}>
                    <UserUtteranceContainer
                        value={l.data[0]} // for now, data is a singleton
                        onChange={v => this.handleChangeUserUtterance(i, v)}
                        onInput={v => this.handleNewUserUtterance(i, v)}
                        onDelete={() => this.handleDeleteLine(i)}
                        onAbort={() => this.handleDeleteLine(i)}
                    />
                    {this.renderAddLine(i)}
                </React.Fragment>
            );
        });

        return (
            <div
                className='story-visual-editor'
            >
                {this.renderAddLine(-1)}
                {lines}
            </div>
        );
    }
}

StoryVisualEditor.propTypes = {
    updateStory: PropTypes.func.isRequired,
    updateResponses: PropTypes.func.isRequired,
    story: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.shape({
                type: 'bot',
                data: PropTypes.shape({
                    name: PropTypes.string,
                }),
            }),
            PropTypes.shape({
                type: 'action',
                data: PropTypes.shape({
                    name: PropTypes.string,
                }),
            }),
            PropTypes.shape({
                type: 'slot',
                data: PropTypes.shape({
                    name: PropTypes.string,
                    value: PropTypes.string,
                }),
            }),
            PropTypes.shape({
                type: 'user',
                data: PropTypes.arrayOf(
                    PropTypes.shape({
                        intent: PropTypes.string,
                        entities: PropTypes.arrayOf(
                            PropTypes.object,
                        ),
                    }),
                ),
            }),
        ]),
    ),
};

StoryVisualEditor.contextType = ConversationOptionsContext;

StoryVisualEditor.defaultProps = {
    story: [],
};

export default StoryVisualEditor;

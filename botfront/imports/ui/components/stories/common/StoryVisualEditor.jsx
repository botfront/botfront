import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { safeDump } from 'js-yaml';

import { StoryController } from '../../../../lib/story_controller';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import BotResponsesContainer from './BotResponsesContainer';
import AddStoryLine from './AddStoryLine';
import ActionLabel from '../ActionLabel';
import SlotLabel from '../SlotLabel';
import { ConversationOptionsContext } from '../../utils/Context';

export const defaultTemplate = (template) => {
    if (template === 'text') {
        return { text: 'click to edit me' };
    }
    if (template === 'qr') {
        return { text: 'click to edit me', buttons: [] };
    }
    return false;
};
class StoryVisualEditor extends React.Component {
    state = {
        lineInsertIndex: null,
    };

    addStoryCursor = React.createRef();

    componentDidUpdate(_prevProps, prevState) {
        const { lineInsertIndex } = this.state;
        if (
            (lineInsertIndex || lineInsertIndex === 0)
            && lineInsertIndex !== prevState.lineInsertIndex
        ) {
            this.addStoryCursor.current.focus();
        }
    }

    handleDeleteLine = (index) => {
        const { story } = this.props;
        story.deleteLine(index);
    };

    handleSaveUserUtterance = (index, value) => {
        const { story, addUtteranceToTrainingData } = this.props;
        addUtteranceToTrainingData(value);
        const updatedLine = { type: 'user', data: [value] };
        story.replaceLine(index, updatedLine);
    }

    handleCreateUserUtterance = (index, payload) => {
        this.setState({ lineInsertIndex: null });
        const { story } = this.props;
        const newLine = { type: 'user', data: [payload || null] };
        story.insertLine(index, newLine);
    };

    handleChangeActionOrSlot = (type, index, data) => {
        const { story } = this.props;
        story.replaceLine(index, { type, data });
    };

    handleCreateSlotOrAction = (index, data) => {
        this.setState({ lineInsertIndex: null });
        const { story } = this.props;
        story.insertLine(index, data);
    };

    handleCreateSequence = (index, template) => {
        this.setState({ lineInsertIndex: null });
        const { story, language, insertResponse } = this.props;
        const key = `utter_${shortid.generate()}`;
        const newTemplate = {
            key,
            values: [
                {
                    sequence: [{ content: safeDump(defaultTemplate(template)) }],
                    lang: language,
                },
            ],
        };
        insertResponse(newTemplate, (err) => {
            if (!err) {
                const newLine = { type: 'bot', data: { name: key } };
                story.insertLine(index, newLine);
            }
        });
    };

    parseUtterance = async (utterance) => {
        const { parseUtterance: rasaParse } = this.props;
        try {
            const { intent, entities, text } = await rasaParse(utterance);
            return { intent: intent.name || '-', entities, text };
        } catch (err) {
            return { text: utterance, intent: '-' };
        }
    };

    renderActionLine = (i, l, deletable = true) => (
        <React.Fragment key={`action${i + l.data.name}`}>
            <div className='utterance-container' agent='na'>
                <ActionLabel
                    value={l.data.name}
                    onChange={v => this.handleChangeActionOrSlot('action', i, { name: v })
                    }
                />
                {deletable && (
                    <FloatingIconButton
                        icon='trash'
                        onClick={() => this.handleDeleteLine(i)}
                    />
                )}
            </div>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    renderSlotLine = (i, l, deletable = true) => (
        <React.Fragment key={`slot${i + l.data.name}`}>
            <div className='utterance-container' agent='na'>
                <SlotLabel
                    value={l.data}
                    onChange={v => this.handleChangeActionOrSlot('slot', i, v)}
                />
                {deletable && (
                    <FloatingIconButton
                        icon='trash'
                        onClick={() => this.handleDeleteLine(i)}
                    />
                )}
            </div>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    // eslint-disable-next-line no-unused-vars
    newLineOptions = storyLine => ({
        // userUtterance: storyLine && storyLine.gui.type !== 'user',
        userUtterance: true,
        botUtterance: true,
        action: true,
        slot: true,
    });

    renderAddLine = (index) => {
        const { lineInsertIndex } = this.state;
        const { story } = this.props;
        const options = this.newLineOptions(story.lines[index]);

        if (!Object.keys(options).length) return null;
        if (
            lineInsertIndex === index
            || (!lineInsertIndex
                && lineInsertIndex !== 0
                && index === story.lines.length - 1)
        ) {
            return (
                <AddStoryLine
                    ref={this.addStoryCursor}
                    availableActions={options}
                    onCreateUtteranceFromInput={() => this.handleCreateUserUtterance(index)
                    }
                    onCreateUtteranceFromPayload={payload => this.handleCreateUserUtterance(index, payload)
                    }
                    onSelectResponse={() => {}} // not needed for now since disableExisting is on
                    onCreateResponse={template => this.handleCreateSequence(index, template)
                    }
                    onSelectAction={action => this.handleCreateSlotOrAction(index, {
                        type: 'action',
                        data: { name: action },
                    })
                    }
                    onSelectSlot={slot => this.handleCreateSlotOrAction(index, { type: 'slot', data: slot })
                    }
                    onBlur={({ relatedTarget }) => {
                        const modals = Array.from(document.querySelectorAll('.modal'));
                        const popups = Array.from(document.querySelectorAll('.popup'));
                        if (
                            !(
                                this.addStoryCursor.current.contains(relatedTarget)
                                || modals.some(m => m.contains(relatedTarget))
                                || popups.some(m => m.contains(relatedTarget))
                                || (relatedTarget && relatedTarget.tagName === 'INPUT')
                            )
                        ) {
                            this.setState({ lineInsertIndex: null });
                        }
                    }}
                />
            );
        }
        return (
            <FloatingIconButton
                icon='ellipsis horizontal'
                className='ellipsis horizontal'
                size='medium'
                onClick={() => this.setState({ lineInsertIndex: index })}
            />
        );
    };

    render() {
        const { story } = this.props;
        if (!story) return <div className='story-visual-editor' />;
        const deletable = story.lines.length > 1;
        const lines = story.lines.map((line, index) => {
            if (line.gui.type === 'action') return this.renderActionLine(index, line.gui, deletable);
            if (line.gui.type === 'slot') return this.renderSlotLine(index, line.gui, deletable);
            if (line.gui.type === 'bot') {
                return (
                    <React.Fragment key={`bot${index + line.gui.data.name}`}>
                        <BotResponsesContainer
                            name={line.gui.data.name}
                            deletable={deletable}
                            onDeleteAllResponses={() => this.handleDeleteLine(index)}
                        />
                        {this.renderAddLine(index)}
                    </React.Fragment>
                );
            }
            return (
                <React.Fragment
                    key={`user${index
                        + (line.gui.data[0]
                            ? line.gui.data[0].intent
                            : shortid.generate())}`}
                >
                    <UserUtteranceContainer
                        deletable={deletable}
                        value={line.gui.data[0]} // for now, data is a singleton
                        onInput={v => this.handleSaveUserUtterance(index, v)}
                        onDelete={() => this.handleDeleteLine(index)}
                        onAbort={() => this.handleDeleteLine(index)}
                    />
                    {this.renderAddLine(index)}
                </React.Fragment>
            );
        });

        return (
            <div className='story-visual-editor'>
                {this.renderAddLine(-1)}
                {lines}
            </div>
        );
    }
}

StoryVisualEditor.propTypes = {
    /* story: PropTypes.arrayOf(
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
    ), */
    story: PropTypes.instanceOf(StoryController),
    insertResponse: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
    parseUtterance: PropTypes.func.isRequired,
    addUtteranceToTrainingData: PropTypes.func.isRequired,
};

StoryVisualEditor.defaultProps = {
    story: [],
};

export default props => (
    <ConversationOptionsContext.Consumer>
        {value => (
            <StoryVisualEditor
                {...props}
                insertResponse={value.insertResponse}
                language={value.language}
                parseUtterance={value.parseUtterance}
                addUtteranceToTrainingData={value.addUtteranceToTrainingData}
            />
        )}
    </ConversationOptionsContext.Consumer>
);

import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { safeDump } from 'js-yaml';
import { promisify } from 'util';

import { StoryController } from '../../../../lib/story_controller';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import BotResponsesContainer from './BotResponsesContainer';
import AddStoryLine from './AddStoryLine';
import ActionLabel from '../ActionLabel';
import SlotLabel from '../SlotLabel';
import { ConversationOptionsContext } from '../../utils/Context';

export const defaultTemplate = (template) => {
    if (template === 'text') { return { text: 'click to edit me' }; }
    if (template === 'qr') { return { text: 'click to edit me', buttons: [] }; }
    return false;
};
class StoryVisualEditor extends React.Component {
    state = {
        lineInsertIndex: null,
    }

    addStoryCursor = React.createRef();

    componentDidMount() {
        this.fetchTextForPayloads();
    }

    componentDidUpdate(_prevProps, prevState) {
        const { lineInsertIndex } = this.state;
        if ((lineInsertIndex || lineInsertIndex === 0) && lineInsertIndex !== prevState.lineInsertIndex) {
            this.addStoryCursor.current.focus();
        }
    }

    handleDeleteLine = (i) => {
        const { story } = this.props;
        story.deleteLine(i);
    }

    handleChangeUserUtterance = async (i, v) => {
        const { story } = this.props;
        const data = typeof v === 'string'
            ? await this.parseUtterance(v)
            : v;
        const updatedLine = { type: 'user', data: [data] };
        story.replaceLine(i, updatedLine);
    }

    handleCreateUserUtterance = (i, pl) => {
        this.setState({ lineInsertIndex: null });
        const { story } = this.props;
        const newLine = { type: 'user', data: [pl || null] };
        story.insertLine(i, newLine);
    }

    handleChangeActionOrSlot = (type, i, data) => {
        const { story } = this.props;
        story.replaceLine(i, { type, data });
    }

    handleCreateSlotOrAction = (i, data) => {
        this.setState({ lineInsertIndex: null });
        const { story } = this.props;
        story.insertLine(i, data);
    }

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

    fetchTextForPayloads = () => {
        const { story, getUtteranceFromPayload } = this.props;
        story.lines.forEach((line, i) => {
            if (!(line.gui.type === 'user')) return;
            if (typeof line.gui.data[0].text === 'undefined') {
                getUtteranceFromPayload(line.gui.data[0], (err, data) => {
                    if (!err) story.replaceLine(i, { type: 'user', data: [data] });
                });
            }
        });
    }

    parseUtterance = async (utterance) => {
        const { parseUtterance: rasaParse } = this.props;
        try {
            const { intent, entities, text } = await promisify(rasaParse)(utterance);
            return { intent: intent.name || '-', entities, text };
        } catch (err) {
            return { text: utterance, intent: '-' };
        }
    };

    renderActionLine = (i, l, deletable = true) => (
        <React.Fragment key={`action${i + l.data.name}`}>
            <div className='utterance-container' agent='na'>
                <ActionLabel value={l.data.name} onChange={v => this.handleChangeActionOrSlot('action', i, { name: v })} />
                { deletable && <FloatingIconButton icon='trash' onClick={() => this.handleDeleteLine(i)} /> }
            </div>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    renderSlotLine = (i, l, deletable = true) => (
        <React.Fragment key={`slot${i + l.data.name}`}>
            <div className='utterance-container' agent='na'>
                <SlotLabel value={l.data} onChange={v => this.handleChangeActionOrSlot('slot', i, v)} />
                { deletable && <FloatingIconButton icon='trash' onClick={() => this.handleDeleteLine(i)} /> }
            </div>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    newLineOptions = storyLine => ({
        // userUtterance: storyLine && storyLine.gui.type !== 'user',
        userUtterance: true,
        botUtterance: true,
        action: true,
        slot: true,
    });

    renderAddLine = (i) => {
        const { lineInsertIndex } = this.state;
        const { story } = this.props;
        const options = this.newLineOptions(story.lines[i]);
        
        if (!Object.keys(options).length) return null;
        if (lineInsertIndex === i || (!lineInsertIndex && lineInsertIndex !== 0 && i === story.lines.length - 1)) {
            return (
                <AddStoryLine
                    ref={this.addStoryCursor}
                    availableActions={options}
                    onCreateUtteranceFromInput={() => this.handleCreateUserUtterance(i)}
                    onCreateUtteranceFromPayload={pl => this.handleCreateUserUtterance(i, pl)}
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
            <FloatingIconButton icon='ellipsis horizontal' className='ellipsis horizontal' size='medium' onClick={() => this.setState({ lineInsertIndex: i })} />
        );
    };

    render() {
        const { story } = this.props;
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
                <React.Fragment key={`user${index + (line.gui.data[0] ? line.gui.data[0].intent : shortid.generate())}`}>
                    <UserUtteranceContainer
                        deletable={deletable}
                        value={line.gui.data[0]} // for now, data is a singleton
                        onChange={v => this.handleChangeUserUtterance(index, v)}
                        onInput={v => this.handleChangeUserUtterance(index, v)}
                        onDelete={() => this.handleDeleteLine(index)}
                        onAbort={() => this.handleDeleteLine(index)}
                    />
                    {this.renderAddLine(index)}
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
    getUtteranceFromPayload: PropTypes.func.isRequired,
    parseUtterance: PropTypes.func.isRequired,
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
                getUtteranceFromPayload={value.getUtteranceFromPayload}
                parseUtterance={value.parseUtterance}
            />
        )}
    </ConversationOptionsContext.Consumer>
);

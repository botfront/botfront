import React from 'react';
import PropTypes from 'prop-types';
import { update as _update } from 'lodash';
import { dump as yamlDump, safeLoad as yamlLoad } from 'js-yaml';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import BotResponsesContainer from './BotResponsesContainer';
import AddStoryLine from './AddStoryLine';
import ActionLabel from '../ActionLabel';
import SlotLabel from '../SlotLabel';
import { ConversationOptionsContext } from '../../utils/Context';

class StoryVisualEditor extends React.Component {
    state = {
        lineInsertIndex: null,
    }

    addStoryCursor = React.createRef();

    componentDidUpdate(_prevProps, prevState) {
        const { lineInsertIndex } = this.state;
        if ((lineInsertIndex || lineInsertIndex === 0) && lineInsertIndex !== prevState.lineInsertIndex) {
            this.addStoryCursor.current.focus();
        }
    }

    handleDeleteLine = (i) => {
        const { story, updateStory } = this.props;
        updateStory([...story.slice(0, i), ...story.slice(i + 1)]);
    }

    updateSequence = (responses, name, lang, updater) => {
        const i = responses.map(r => r.key).indexOf(name);
        const j = responses[i].values.map(v => v.lang).indexOf(lang);
        const path = `[${i}].values[${j}].sequence`;
        const newResponses = [...responses];
        return _update(newResponses, path, updater);
    }

    handleDeleteResponse = (name, j) => {
        const { responses, lang, updateResponses } = this.context;
        const updater = sequence => ([...sequence.slice(0, j), ...sequence.slice(j + 1)]);
        const newResponses = this.updateSequence(responses, name, lang, updater);
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
        const { story, updateStory } = this.props;
        const { responses, lang, updateResponses } = this.context;
        const key = this.findResponseName();
        const newResponse = {
            key,
            values: [{
                lang,
                sequence: [{ content: this.defaultTemplate(template) }],
            }],
        };
        updateResponses(responses.concat([newResponse]));
        const newLine = {
            type: 'bot',
            data: { name: key },
        };
        updateStory([...story.slice(0, i + 1), newLine, ...story.slice(i + 1)]);
    }

    handleCreateResponse = (name, j, template) => {
        const { responses, lang, updateResponses } = this.context;
        const updater = sequence => ([...sequence.slice(0, j + 1), { content: this.defaultTemplate(template) }, ...sequence.slice(j + 1)]);
        const newResponses = this.updateSequence(responses, name, lang, updater);
        updateResponses(newResponses);
    }

    handleChangeResponse = (name, j, content) => {
        const { responses, lang, updateResponses } = this.context;
        const updater = sequence => ([...sequence.slice(0, j), { content: yamlDump(content) }, ...sequence.slice(j + 1)]);
        const newResponses = this.updateSequence(responses, name, lang, updater);
        updateResponses(newResponses);
    }

    defaultTemplate = (template) => {
        if (template === 'text') { return yamlDump({ text: '' }); }
        if (template === 'qr') { return yamlDump({ text: '', buttons: [] }); }
        return false;
    }

    parseUtterance = u => ({
        text: u,
        intent: 'dummdummIntent',
    });

    findResponseName = () => {
        const { responses } = this.context;
        const unnamedResponses = responses
            .map(r => r.key)
            .filter(r => r.indexOf('utter_new') === 0);
        return `utter_new_${unnamedResponses.length + 1}`;
    }

    renderActionLine = (i, l) => (
        <React.Fragment key={i + l.data.name}>
            <ActionLabel value={l.data.name} />
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    renderSlotLine = (i, l) => (
        <React.Fragment key={i + l.data.name}>
            <SlotLabel value={l.data} />
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
        const lines = story.map((line, i) => {
            if (line.type === 'action') return this.renderActionLine(i, line);
            if (line.type === 'slot') return this.renderSlotLine(i, line);
            if (line.type === 'bot') {
                return (
                    <React.Fragment key={i + line.data.name}>
                        <BotResponsesContainer
                            name={line.data.name}
                            onDeleteAllResponses={() => this.handleDeleteLine(i)}
                            onDeleteResponse={j => this.handleDeleteResponse(line.data.name, j)}
                            onCreateResponse={(j, template) => this.handleCreateResponse(line.data.name, j, template)}
                            onChangeResponse={(j, content) => this.handleChangeResponse(line.data.name, j, content)}
                        />
                        {this.renderAddLine(i)}
                    </React.Fragment>
                );
            }
            return (
                <React.Fragment key={i + (line.data[0] ? line.data[0].intent : '')}>
                    <UserUtteranceContainer
                        value={line.data[0]} // for now, data is a singleton
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

export const { updateSequence } = StoryVisualEditor.prototype;
export default StoryVisualEditor;

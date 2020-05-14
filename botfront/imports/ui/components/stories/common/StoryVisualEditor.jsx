import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { isEqual } from 'lodash';

import { Icon } from 'semantic-ui-react';
import { OOS_LABEL } from '../../constants.json';
import { StoryController, NEW_INTENT } from '../../../../lib/story_controller';
import IconButton from '../../common/IconButton';
import UserUtterancesContainer from './UserUtterancesContainer';
import BotResponsesContainer from './BotResponsesContainer';
import AddStoryLine from './AddStoryLine';
import ActionLabel from '../ActionLabel';
import SlotLabel from '../SlotLabel';
import BadLineLabel from '../BadLineLabel';
import { ProjectContext } from '../../../layouts/context';
import ExceptionWrapper from './ExceptionWrapper';
import GenericLabel from '../GenericLabel';
import { defaultTemplate } from '../../../../lib/botResponse.utils';

const variationIndex = 0;

export default class StoryVisualEditor extends React.Component {
    state = {
        lineInsertIndex: null,
        responseLocations: [],
        loadingResponseLocations: false,
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

    menuCloser = () => {};

    trackOpenMenu = (func) => { this.menuCloser = func; };

    handleDeleteLine = (index) => {
        const { story } = this.props;
        story.deleteLine(index);
    };

    handleSaveUserUtterance = (index, data) => {
        const { story } = this.props;
        const { addUtterancesToTrainingData } = this.context;
        addUtterancesToTrainingData(data, (err) => {
            if (!err) {
                const updatedLine = { type: 'user', data };
                story.replaceLine(index, updatedLine);
            }
        });
    };

    handleCreateUserUtterance = (index, payload) => {
        const { story } = this.props;
        const newLine = { type: 'user', data: [payload || { intent: NEW_INTENT }] };
        story.insertLine(index, newLine);
        this.setState({ lineInsertIndex: null });
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

    handleCreateSequence = (index, templateType, suppliedKey) => {
        this.setState({ lineInsertIndex: null });
        const { story } = this.props;
        const { upsertResponse } = this.context;
        const key = suppliedKey || `utter_${shortid.generate()}`;
        const newTemplate = defaultTemplate(templateType);
        upsertResponse(key, { ...newTemplate, isNew: true }, variationIndex).then((full) => {
            if (full) story.insertLine(index, { type: 'bot', data: { name: key } });
        });
    };

    parseUtterance = async (utterance) => {
        const { parseUtterance: rasaParse } = this.context;
        try {
            const { intent, entities, text } = await rasaParse(utterance);
            return { intent: intent.name || OOS_LABEL, entities, text };
        } catch (err) {
            return { text: utterance, intent: OOS_LABEL };
        }
    };

    renderAddLine = (index) => {
        const { lineInsertIndex } = this.state;
        const { story } = this.props;
        const options = story.getPossibleInsertions(index);

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
                    trackOpenMenu={this.trackOpenMenu}
                    availableActions={options}
                    onCreateUtteranceFromInput={() => this.handleCreateUserUtterance(index)}
                    onCreateUtteranceFromPayload={payload => this.handleCreateUserUtterance(index, payload)}
                    onCreateResponse={templateType => this.handleCreateSequence(index, templateType)}
                    onSelectAction={action => this.handleCreateSlotOrAction(index, {
                        type: 'action', data: { name: action },
                    })}
                    onSelectSlot={slot => this.handleCreateSlotOrAction(index, { type: 'slot', data: slot })}
                    onBlur={({ relatedTarget }) => {
                        const modals = Array.from(document.querySelectorAll('.modal'));
                        const popups = Array.from(document.querySelectorAll('.popup'));
                        if (
                            !(
                                this.addStoryCursor.current.contains(relatedTarget)
                                || modals.length
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
            <Icon
                name='ellipsis horizontal'
                onClick={() => this.setState({ lineInsertIndex: index })}
            />
        );
    };

    renderActionLine = (i, l, exceptions) => (
        <React.Fragment key={`action${i + l.data.name}`}>
            <ExceptionWrapper exceptions={exceptions}>
                <div className='story-line'>
                    <ActionLabel
                        value={l.data.name}
                        onChange={v => this.handleChangeActionOrSlot('action', i, { name: v })}
                    />
                    <IconButton onClick={() => this.handleDeleteLine(i)} icon='trash' />
                </div>
            </ExceptionWrapper>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    renderSlotLine = (i, l, exceptions) => (
        <React.Fragment key={`slot${i + l.data.name}`}>
            <ExceptionWrapper exceptions={exceptions}>
                <div className='story-line'>
                    <SlotLabel
                        value={l.data}
                        onChange={v => this.handleChangeActionOrSlot('slot', i, v)}
                    />
                    <IconButton onClick={() => this.handleDeleteLine(i)} icon='trash' />
                </div>
            </ExceptionWrapper>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    renderBadLine = (index, line, exceptions) => (
        <React.Fragment key={`BadLine-${index}`}>
            <ExceptionWrapper exceptions={exceptions}>
                <div className='story-line'>
                    <BadLineLabel lineMd={line.md} lineIndex={index} />
                    <IconButton onClick={() => this.handleDeleteLine(index)} icon='trash' />
                </div>
            </ExceptionWrapper>
            {this.renderAddLine(index)}
        </React.Fragment>
    );

    renderFormLine = (index, line, exceptions) => (
        <React.Fragment key={`FormLine-${index}`}>
            <ExceptionWrapper exceptions={exceptions}>
                <div className='story-line'>
                    <GenericLabel
                        label={line.gui.type}
                        value={line.gui.data.name}
                        color={line.gui.type === 'form' ? 'yellow' : 'olive'}
                    />
                    <IconButton onClick={() => this.handleDeleteLine(index)} icon='trash' />
                </div>
            </ExceptionWrapper>
            {this.renderAddLine(index)}
        </React.Fragment>
    );

    handleBotResponseChange = async (name, newResponse, newType) => {
        const { upsertResponse, responses } = this.context;
        if (isEqual(responses[name], newResponse)) return;
        upsertResponse(name, newResponse, variationIndex, newType);
    }

    static contextType = ProjectContext;

    render() {
        const { story, getResponseLocations } = this.props;
        const { responses } = this.context;
        const { language } = this.context;
        const { responseLocations, loadingResponseLocations } = this.state;
        if (!story) return <div className='story-visual-editor' />;
        const lines = story.lines.map((line, index) => {
            const exceptions = story.exceptions.filter(
                exception => exception.line === index + 1,
            );

            if (line.gui.type === 'action') return this.renderActionLine(index, line.gui, exceptions);
            if (line.gui.type === 'slot') return this.renderSlotLine(index, line.gui, exceptions);
            if (line.gui.type === 'bot') {
                const { name } = line.gui.data;
                return (
                    <React.Fragment key={`bot-${index}-${name}-${language}`}>
                        <ExceptionWrapper exceptions={exceptions}>
                            <BotResponsesContainer
                                deletable
                                exceptions={exceptions}
                                name={name}
                                initialValue={responses[name]}
                                onChange={(newResponse, newType) => this.handleBotResponseChange(name, newResponse, newType)}
                                onDeleteAllResponses={() => this.handleDeleteLine(index)}
                                responseLocations={responseLocations[name]}
                                loadingResponseLocations={loadingResponseLocations}
                            />
                        </ExceptionWrapper>
                        {this.renderAddLine(index)}
                    </React.Fragment>
                );
            }
            if (line.gui.type === 'user') {
                return (
                    <React.Fragment key={`user-${index}-${line.md || ''}-${language}`}>
                        <ExceptionWrapper exceptions={exceptions}>
                            <UserUtterancesContainer
                                value={line.gui.data}
                                onChange={v => this.handleSaveUserUtterance(index, v)}
                                onDelete={() => this.handleDeleteLine(index)}
                            />
                        </ExceptionWrapper>
                        {this.renderAddLine(index)}
                    </React.Fragment>
                );
            }
            if (['form_decl', 'form'].includes(line.gui.type)) {
                return this.renderFormLine(index, line, exceptions);
            }
            return this.renderBadLine(index, line, exceptions);
        });

        return (
            <div
                className='story-visual-editor'
                onMouseEnter={() => {
                    this.setState({ loadingResponseLocations: true });
                    const storyResponses = story.lines.reduce((value, { gui }) => {
                        if (gui.type === 'bot') value.push(gui.data.name);
                        return value;
                    }, []);
                    getResponseLocations(storyResponses, (err, result) => {
                        this.setState({ loadingResponseLocations: false });
                        if (err) return;
                        this.setState({ responseLocations: result });
                    });
                }}
                onMouseLeave={() => { this.menuCloser(); this.menuCloser = () => {}; }}
            >
                {this.renderAddLine(-1)}
                {lines}
            </div>
        );
    }
}

StoryVisualEditor.propTypes = {
    story: PropTypes.instanceOf(StoryController),
    getResponseLocations: PropTypes.func.isRequired,
};

StoryVisualEditor.defaultProps = {
    story: [],
};

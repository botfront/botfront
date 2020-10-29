import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { isEqual } from 'lodash';
import { safeDump } from 'js-yaml';

import { Icon } from 'semantic-ui-react';
import IconButton from '../../common/IconButton';
import UserUtterancesContainer from './UserUtterancesContainer';
import BotResponsesContainer from './BotResponsesContainer';
import AddStoryLine from './AddStoryLine';
import ActionLabel from '../ActionLabel';
import SlotsContainer from './SlotsContainer';
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

    trackOpenMenu = (func) => {
        this.menuCloser = func;
    };

    handleDeleteLine = (index, nLines = 1) => {
        const { story, onSave } = this.props;
        onSave([...story.slice(0, index), ...story.slice(index + nLines)]);
    };

    handleReplaceLine = (index, content) => {
        const { story, onSave } = this.props;
        onSave([...story.slice(0, index), content, ...story.slice(index + 1)]);
    };

    handleInsertLine = (index, content) => {
        const { story, onSave } = this.props;
        const contentAsArray = Array.isArray(content) ? content : [content];
        onSave([...story.slice(0, index + 1), ...contentAsArray, ...story.slice(index + 1)]);
        this.setState({ lineInsertIndex: null });
    };

    handleInsertBotResponse = (index, templateType, suppliedKey) => {
        this.setState({ lineInsertIndex: null });
        const { upsertResponse } = this.context;
        const key = suppliedKey || `utter_${shortid.generate()}`;
        const newTemplate = defaultTemplate(templateType);
        upsertResponse(
            key,
            { payload: { ...newTemplate }, isNew: true },
            variationIndex,
        ).then((full) => {
            if (full) this.handleInsertLine(index, { action: key });
        });
    };

    getReadOnlyClass = () => '';

    renderAddLine = (rawIndex) => {
        const { lineInsertIndex } = this.state;
        const { story, mode } = this.props;
        let index = rawIndex;
        const [currentLine, nextLine] = [story[index] || {}, story[index + 1] || {}];
        if (this.loopLinesMatch(currentLine, nextLine)) index += 1;
        const lineIsIntent = l => 'intent' in l || 'or' in l;
        const hasSlot = story.some(l => 'slot_was_set' in l);
        const hasLoop = story.some(l => 'active_loop' in l);

        const options = {
            userUtterance:
                mode !== 'rule_condition'
                && (mode !== 'rule_steps' || !story.some(lineIsIntent))
                && !lineIsIntent(currentLine)
                && !lineIsIntent(nextLine),
            botUtterance: mode !== 'rule_condition',
            action: mode !== 'rule_condition',
            slot: mode !== 'rule_condition' || !hasSlot,
            loopActive: mode !== 'rule_condition' || !hasLoop,
            loopActivate: mode !== 'rule_condition',
        };

        if (!Object.keys(options).length) return null;
        if (
            lineInsertIndex === index
            || (!lineInsertIndex && lineInsertIndex !== 0 && index === story.length - 1)
        ) {
            return (
                <AddStoryLine
                    ref={this.addStoryCursor}
                    trackOpenMenu={this.trackOpenMenu}
                    availableActions={options}
                    onCreateUtteranceFromInput={() => this.handleInsertLine(index, { intent: null })}
                    onCreateUtteranceFromPayload={payload => this.handleInsertLine(index, payload)}
                    onCreateResponse={templateType => this.handleInsertBotResponse(index, templateType)}
                    onCreateGenericLine={data => this.handleInsertLine(index, data)}
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
                className='line-insert'
                onClick={() => this.setState({ lineInsertIndex: index })}
            />
        );
    };

    renderActionLine = (i, l, exceptions) => (
        <React.Fragment key={`action${i + l.action}`}>
            <ExceptionWrapper exceptions={exceptions}>
                <div className='story-line'>
                    <ActionLabel
                        value={l.action}
                        onChange={v => this.handleReplaceLine(i, { action: v })}
                    />
                    <IconButton onClick={() => this.handleDeleteLine(i)} icon='trash' />
                </div>
            </ExceptionWrapper>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    renderSlotLine = (i, l, exceptions) => (
        <React.Fragment key={`slot${i + JSON.stringify(l.slot_was_set)}`}>
            <ExceptionWrapper exceptions={exceptions}>
                <SlotsContainer
                    deletable
                    value={l.slot_was_set}
                    onChange={slot_was_set => this.handleReplaceLine(i, { slot_was_set })}
                    onDelete={() => this.handleDeleteLine(i)}
                />
            </ExceptionWrapper>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

    renderEllipsisLine = (i, l, exceptions) => (
        <React.Fragment key={`ellipsis${i}`}>
            <ExceptionWrapper exceptions={exceptions}>
                <div data-cy='ellipsis' className='story-line'>
                    <GenericLabel
                        label={<Icon name='ellipsis horizontal' style={{ margin: '0 10px' }} />}
                        color='light-grey'
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
                    <BadLineLabel
                        lineMd={`${safeDump(line).substring(0, 31)}${
                            safeDump(line).length > 30 ? '...' : ''
                        }`}
                        lineIndex={index}
                    />
                    <IconButton
                        onClick={() => this.handleDeleteLine(index)}
                        icon='trash'
                    />
                </div>
            </ExceptionWrapper>
            {this.renderAddLine(index)}
        </React.Fragment>
    );

    determineLoopLineLabelAndValue = (line, isSequence = false) => {
        const value = line.active_loop;
        let label = 'active loop';
        if (isSequence) label = 'activate loop';
        if (!value) label = 'no active loop';
        return { value, label };
    };

    loopLinesMatch = (firstLine, secondLine) => (
        firstLine?.action
        && secondLine?.active_loop
        && firstLine.action === secondLine.active_loop
    );

    isLoopSequence = (index) => {
        const { story } = this.props;
        const line = story[index];
        const before = index > 0 ? story[index - 1] : null;
        const after = index < story.length - 1 ? story[index + 1] : null;
        const isFirstLineOfSeq = this.loopLinesMatch(line, after);
        const isSecondLineOfSeq = this.loopLinesMatch(before, line);
        return { isFirstLineOfSeq, isSecondLineOfSeq };
    }

    renderLoopLine = (index, line, exceptions) => {
        const { isSecondLineOfSeq } = this.isLoopSequence(index);
        return (
            <React.Fragment key={`LoopLine-${index}`}>
                <ExceptionWrapper exceptions={exceptions}>
                    <div className={`story-line ${this.getReadOnlyClass()}`}>
                        <GenericLabel
                            {...this.determineLoopLineLabelAndValue(
                                line,
                                isSecondLineOfSeq,
                            )}
                            color='botfront-blue'
                        />
                        <IconButton
                            onClick={() => this.handleDeleteLine(...(isSecondLineOfSeq ? [index - 1, 2] : [index]))}
                            icon='trash'
                        />
                    </div>
                </ExceptionWrapper>
                {this.renderAddLine(index)}
            </React.Fragment>
        );
    };

    handleSaveBotResponse = async (i, name, newResponse) => {
        const { key: newName, payload } = newResponse;
        const { upsertResponse, responses } = this.context;
        if (isEqual(responses[name], payload) && newName === name) return;
        const result = await upsertResponse(name, newResponse, variationIndex);
        if (result?.data?.upsertResponse?.key === newName) {
            this.handleReplaceLine(i, { action: newName });
        }
    };

    handleSaveUserUtterance = (index, value) => {
        if (value.length === 1) this.handleReplaceLine(index, value[0]);
        else this.handleReplaceLine(index, { or: value });
    };

    renderLine = (line, index) => {
        const { responses } = this.context;
        const { language } = this.context;
        const { responseLocations, loadingResponseLocations } = this.state;
        const exceptions = [];

        if ('active_loop' in line) {
            return this.renderLoopLine(index, line, exceptions);
        }
        if ('action' in line) {
            if (line.action.indexOf('utter_') === 0) {
                const name = line.action;
                return (
                    <React.Fragment key={`bot-${index}-${name}-${language}`}>
                        <ExceptionWrapper exceptions={exceptions}>
                            <BotResponsesContainer
                                deletable
                                exceptions={exceptions}
                                name={name}
                                initialValue={responses[name]}
                                onChange={newResponse => this.handleSaveBotResponse(index, name, newResponse)}
                                onDeleteAllResponses={() => this.handleDeleteLine(index)}
                                responseLocations={responseLocations[name]}
                                loadingResponseLocations={loadingResponseLocations}
                            />
                        </ExceptionWrapper>
                        {this.renderAddLine(index)}
                    </React.Fragment>
                );
            }
            if (this.isLoopSequence(index)?.isFirstLineOfSeq) return null;
            return this.renderActionLine(index, line, exceptions);
        }
        if ('slot_was_set' in line) {
            return this.renderSlotLine(index, line, exceptions);
        }
        if ('or' in line || 'intent' in line) {
            return (
                <React.Fragment key={`user-${index}-${line.md || ''}-${language}`}>
                    <ExceptionWrapper exceptions={exceptions}>
                        <UserUtterancesContainer
                            value={line.or || [line]}
                            onChange={v => this.handleSaveUserUtterance(index, v)}
                            onDelete={() => this.handleDeleteLine(index)}
                        />
                    </ExceptionWrapper>
                    {this.renderAddLine(index)}
                </React.Fragment>
            );
        }
        return this.renderBadLine(index, line, exceptions);
    };

    static contextType = ProjectContext;

    render() {
        const { story, getResponseLocations } = this.props;
        if (!story) return <div className='story-visual-editor' />;
        return (
            <div
                className='story-visual-editor'
                onMouseEnter={() => {
                    this.setState({ loadingResponseLocations: true });
                    const storyResponses = story.reduce((value, { action = '' }) => {
                        if (action.indexOf('utter_') === 0) value.push(action);
                        return value;
                    }, []);
                    getResponseLocations(storyResponses, (err, result) => {
                        this.setState({ loadingResponseLocations: false });
                        if (err) return;
                        this.setState({ responseLocations: result });
                    });
                }}
                onMouseLeave={() => {
                    this.menuCloser();
                    this.menuCloser = () => {};
                }}
            >
                {this.renderAddLine(-1)}
                {story.map((line, index) => this.renderLine(line, index))}
            </div>
        );
    }
}

StoryVisualEditor.propTypes = {
    onSave: PropTypes.func.isRequired,
    story: PropTypes.array.isRequired,
    getResponseLocations: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['story', 'rule_steps', 'rule_condition']),
};

StoryVisualEditor.defaultProps = {
    mode: 'story',
};

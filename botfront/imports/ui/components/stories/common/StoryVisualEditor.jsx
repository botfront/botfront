import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import { safeDump } from 'js-yaml';

import { OOS_LABEL } from '../../constants.json';
import { StoryController } from '../../../../lib/story_controller';
import FloatingIconButton from '../../common/FloatingIconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import BotResponsesContainer from './BotResponsesContainer';
import AddStoryLine from './AddStoryLine';
import ActionLabel from '../ActionLabel';
import SlotLabel from '../SlotLabel';
import BadLineLabel from '../BadLineLabel';
import { ProjectContext } from '../../../layouts/context';
import ExceptionWrapper from './ExceptionWrapper';
import GenericLabel from '../GenericLabel';

export const defaultTemplate = (template) => {
    if (template === 'text') {
        return { text: '' };
    }
    if (template === 'qr') {
        return {
            text: '',
            buttons: [
                {
                    title: '',
                    type: 'postback',
                    payload: '',
                },
            ],
        };
    }
    return false;
};

class StoryVisualEditor extends React.Component {
    state = {
        lineInsertIndex: null,
        menuCloser: () => {},
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


    trackOpenMenu = func => this.setState({ menuCloser: func });

    handleDeleteLine = (index) => {
        const { story } = this.props;
        story.deleteLine(index);
        // This is needed as the lines are not evaluated when checking for rerenders.
        this.forceUpdate();
    };

    handleSaveUserUtterance = (index, value) => {
        const { story, addUtteranceToTrainingData } = this.props;
        addUtteranceToTrainingData(value, (err) => {
            if (!err) {
                const updatedLine = { type: 'user', data: [value] };
                story.replaceLine(index, updatedLine);
            }
        });
    };

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
        story.addTemplate(newTemplate);
        insertResponse(newTemplate, (err) => {
            if (!err) {
                const newLine = { type: 'bot', data: { name: key, new: true } };
                story.insertLine(index, newLine);
            }
        });
    };

    parseUtterance = async (utterance) => {
        const { parseUtterance: rasaParse } = this.props;
        try {
            const { intent, entities, text } = await rasaParse(utterance);
            return { intent: intent.name || OOS_LABEL, entities, text };
        } catch (err) {
            return { text: utterance, intent: OOS_LABEL };
        }
    };

    formatErrors = (exceptions) => {
        const messages = exceptions.map(({ message }) => (
            <>
                {message
                    .split('`')
                    .forEach((bit, idx) => (idx % 2 === 0 ? bit : <i>{bit}</i>))}
            </>
        ));
        if (exceptions.some(exception => exception.type === 'error')) return { severity: 'error', messages };
        if (exceptions.some(exception => exception.type === 'warning')) return { severity: 'warning', messages };
        return { severity: null, messages };
    };

    renderActionLine = (i, l, exceptions) => (
        <React.Fragment key={`action${i + l.data.name}`}>
            <div className={`utterance-container ${exceptions.severity}`} agent='na'>
                <ExceptionWrapper exceptions={exceptions}>
                    <ActionLabel
                        value={l.data.name}
                        onChange={v => this.handleChangeActionOrSlot('action', i, { name: v })
                        }
                    />
                    <FloatingIconButton
                        icon='trash'
                        onClick={() => this.handleDeleteLine(i)}
                    />
                </ExceptionWrapper>
            </div>
            {this.renderAddLine(i)}
        </React.Fragment>
    )

    renderSlotLine = (i, l, exceptions) => (
        <React.Fragment key={`slot${i + l.data.name}`}>
            <div className={`utterance-container ${exceptions.severity}`} agent='na'>
                <ExceptionWrapper exceptions={exceptions}>
                    <SlotLabel
                        value={l.data}
                        onChange={v => this.handleChangeActionOrSlot('slot', i, v)}
                    />
                    <FloatingIconButton
                        icon='trash'
                        onClick={() => this.handleDeleteLine(i)}
                    />
                </ExceptionWrapper>
            </div>
            {this.renderAddLine(i)}
        </React.Fragment>
    );

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
                    onCreateResponse={template => this.handleCreateSequence(index, template)}
                    onSelectAction={action => this.handleCreateSlotOrAction(index, {
                        type: 'action',
                        data: { name: action },
                    })}
                    onSelectSlot={slot => this.handleCreateSlotOrAction(index, { type: 'slot', data: slot })}
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

    renderBadLine = (index, line, exceptions) => (
        <React.Fragment key={`BadLine-${index}`}>
            <div className={`utterance-container ${exceptions.severity}`} agent='na'>
                <ExceptionWrapper exceptions={exceptions}>
                    <BadLineLabel lineMd={line.md} lineIndex={index} />
                    <FloatingIconButton
                        icon='trash'
                        onClick={() => this.handleDeleteLine(index)}
                    />
                </ExceptionWrapper>
            </div>
            {this.renderAddLine(index)}
        </React.Fragment>
    )

    renderFormLine = (index, line, exceptions) => (
        <React.Fragment key={`FormLine-${index}`}>
            <div className={`utterance-container ${exceptions.severity}`} agent='na'>
                <ExceptionWrapper exceptions={exceptions}>
                    <GenericLabel
                        label={line.gui.type}
                        value={line.gui.data.name}
                        color={line.gui.type === 'form' ? 'yellow' : 'olive'}
                    />
                    <FloatingIconButton
                        icon='trash'
                        onClick={() => this.handleDeleteLine(index)}
                    />
                </ExceptionWrapper>
            </div>
            {this.renderAddLine(index)}
        </React.Fragment>
    )

    render() {
        const {
            story, language,
        } = this.props;
        const { menuCloser } = this.state;
        if (!story) return <div className='story-visual-editor' />;
        const lines = story.lines.map((line, index) => {
            const exceptions = story.exceptions.filter(exception => exception.line === index + 1);
            
            if (line.gui.type === 'action') return this.renderActionLine(index, line.gui, exceptions);
            if (line.gui.type === 'slot') return this.renderSlotLine(index, line.gui, exceptions);
            if (line.gui.type === 'bot') {
                return (
                    <React.Fragment key={`bot${line.gui.data.name}-${index}`}>
                        <BotResponsesContainer
                            language={language}
                            deletable
                            exceptions={exceptions}
                            name={line.gui.data.name}
                            onDeleteAllResponses={() => this.handleDeleteLine(index)}
                            isNew={!!line.gui.data.new}
                            removeNewState={() => story.replaceLine(index, {
                                type: 'bot',
                                data: { name: line.gui.data.name },
                            })
                            }
                        />
                        {this.renderAddLine(index)}
                    </React.Fragment>
                );
            }
            if (line.gui.type === 'user') {
                return (
                    <React.Fragment
                        key={`user${line.md || ''}-${index}`}
                    >
                        <UserUtteranceContainer
                            exceptions={exceptions}
                            value={line.gui.data[0]} // for now, data is a singleton
                            onInput={v => this.handleSaveUserUtterance(index, v)}
                            onDelete={() => this.handleDeleteLine(index)}
                            onAbort={() => this.handleDeleteLine(index)}
                        />
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
            <div className='story-visual-editor' onMouseLeave={menuCloser}>
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
    <ProjectContext.Consumer>
        {value => (
            <StoryVisualEditor
                {...props}
                insertResponse={value.insertResponse}
                language={value.language}
                parseUtterance={value.parseUtterance}
                addUtteranceToTrainingData={value.addUtteranceToTrainingData}
            />
        )}
    </ProjectContext.Consumer>
);

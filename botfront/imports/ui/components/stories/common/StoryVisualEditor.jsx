import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'semantic-ui-react';
import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UserUtteranceContainer from './UserUtteranceContainer';
import BotResponsesContainer from './BotResponsesContainer';
import { ConversationOptionsContext } from '../../utils/Context';

class StoryVisualEditor extends React.Component {
    handleDeleteLine = (i) => {
        const { story, updateStory } = this.props;
        updateStory([...story.slice(0, i), ...story.slice(i + 1)]);
    }

    handleDeleteResponse = (name, i) => {
        const { updateResponses } = this.props;
        const { responses } = this.context;
        const newResponses = { ...responses };
        newResponses[name] = [...responses[name].slice(0, i), ...responses[name].slice(i + 1)];
        updateResponses(newResponses);
    };

    renderOtherLine = (i, l) => (
        <>
            <div
                key={i + l.data.name}
                className='utterance-container'
                agent={l.type}
            >
                <div className='inner'>
                    <Label color={l.type === 'action' ? 'pink' : 'orange'}>
                        {l.type}: {l.data.name}
                        {Object.keys(l.data).filter(k => k !== 'name')
                            .map(k => <>, {k}: {l.data[k]} </>)
                        }
                    </Label>
                </div>
                <FloatingIconButton
                    icon='trash'
                    onClick={() => this.handleDeleteLine(i)}
                />
            </div>
            {this.renderAddLine(i)}
        </>
    );

    renderAddLine = (i) => {
        const { newLineOptions } = this.props;
        const options = newLineOptions(i);
        if (!options.length) return null;
        return (
            <FloatingIconButton icon='ellipsis horizontal' />
        );
    };

    render() {
        const { story } = this.props;

        const lines = story.map((l, i) => {
            if (!['bot', 'user'].includes(l.type)) return this.renderOtherLine(i, l); // placeholder for slots and actions
            if (l.type === 'bot') {
                return (
                    <>
                        <BotResponsesContainer
                            key={i + l.data.name}
                            name={l.data.name}
                            onDeleteAllResponses={() => this.handleDeleteLine(i)}
                            onDeleteResponse={j => this.handleDeleteResponse(l.data.name, j)}
                        />
                        {this.renderAddLine(i)}
                    </>
                );
            }
            return (
                <>
                    <UserUtteranceContainer
                        key={i + l.data[0].intent}
                        value={l.data[0]} // for now, data is a singleton
                        onDelete={() => this.handleDeleteLine(i)}
                    />
                    {this.renderAddLine(i)}
                </>
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
    newLineOptions: PropTypes.func,
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
    newLineOptions: (i) => ['yo'],
};

export default StoryVisualEditor;

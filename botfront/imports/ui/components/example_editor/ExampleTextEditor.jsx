import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import TextArea from 'react-textarea-autosize';
import { sortBy, isNull } from 'lodash';

import getColor from '../../../lib/getColors';

const emptyExample = () => ({ text: '', intent: '', entities: [] });

export class ExampleTextEditor extends React.Component {
    state = {}

    componentDidMount() {
        const { autofocus, example = {} } = this.props;
        const { text = '' } = example;
        this.setState({ example });
        if (autofocus) {
            const exampleTextArea = document.getElementById('example-text-area');
            exampleTextArea?.focus();
            exampleTextArea?.setSelectionRange(text.length, text.length);
        }
    }

    handleTextChange = (event) => {
        const { example } = this.state;
        const {
            onChange,
            example: { text: oldText, entities: oldEntities } = {},
        } = this.props;
        const text = event.target.value;

        // Get boundary indexes of text change
        // Assume only one insertion/deletion/replacement
        let changeBegin = oldText.length;
        oldText.split('').some((c, i) => {
            if (c !== text.charAt(i)) {
                changeBegin = i;
                return true;
            }
            return false;
        });

        // Helpers
        function indexFromBeginning(string, fromEnd) {
            return string.length - fromEnd - 1;
        }
        function charFromEnd(string, fromEnd) {
            return string.charAt(indexFromBeginning(string, fromEnd));
        }

        let relativeEnd = 0;
        let changeEnd = oldText.length; // index after first conflict
        let changeEndNew = text.length;
        while (charFromEnd(oldText, relativeEnd) === charFromEnd(text, relativeEnd)) {
            relativeEnd += 1;
            changeEnd -= 1; // index after first conflict
            changeEndNew -= 1;

            if (changeEnd <= changeBegin || changeEndNew <= changeBegin) {
                break;
            }
        }
        // Determine action on entities
        const entities = oldEntities
            .map((entity) => {
                const changeSizeOld = changeEnd - changeBegin;
                const changeSizeNew = changeEndNew - changeBegin;
                const sizeChange = changeSizeNew - changeSizeOld;

                let { value, start, end } = entity;
                if (changeEnd <= start) {
                    // Change is before entity begins
                    start += sizeChange;
                    end += sizeChange;
                } else if (changeBegin >= end) {
                    // Change after copy ends
                } else if (changeBegin <= start && changeEnd >= end) {
                    // Change consumes entity
                    return null;
                } else if (changeBegin <= start && changeEnd >= start) {
                    // Change cuts the beginning
                    start = changeEndNew;
                    end += sizeChange;
                } else if (changeEnd >= end && changeBegin <= end) {
                    // Change cuts end
                    end = changeBegin;
                } else {
                    // Change is internal to the entity
                    end += sizeChange;
                }

                if (start === end) {
                    return null;
                }

                value = text.substring(start, end);
                return { ...entity, ...{ value, start, end } };
            })
            .filter(e => !isNull(e));

        // Update state
        const updatedExample = { ...example, text, entities };
        this.setState({ example: updatedExample });
        onChange(updatedExample);
    };

    highLightEntitiesInText = () => {
        const { example: { entities = [], text } = {} } = this.state;
        const sortedEntities = sortBy(
            entities.filter(e => !e.extractor || e.extractor === 'ner_crf'),
            'start',
        );
        const spans = [];
        sortedEntities.forEach((e, i) => {
            if (i === 0 && e.start > 0) { spans.push(<span key='before-entities'>{text.substr(0, e.start)}</span>); }
            spans.push(
                <span key={`${e.entity}-${i}`} style={{ ...getColor(e.entity) }}>
                    {text.substr(e.start, e.end - e.start)}
                </span>,
            );
            if (i < sortedEntities.length - 1) {
                spans.push(
                    <span key={`between-${e.entity}-${i}`}>
                        {text.substr(e.end, sortedEntities[i + 1].start - e.end)}
                    </span>,
                );
            }
            if (i === sortedEntities.length - 1) {
                spans.push(
                    <span key='after-entities'>
                        {text.substr(e.end, e.value.length - e.end)}
                    </span>,
                );
            }
        });
        return spans;
    };

    handleKeyDown = (e) => {
        const { onSave, onCancel } = this.props;
        const { example } = this.state;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSave(example);
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            this.justEscaped = true;
            onCancel();
        }
    };

    swallowEvent = (e) => {
        e.stopPropagation();
    };

    render() {
        const { example: { text = '' } = {}, example } = this.state;
        const {
            highlightEntities, onSave,
        } = this.props;
        return (
            <Form className='example-editor-container' data-cy='example-editor-container'>
                <TextArea
                    id='example-text-area'
                    placeholder='User says...'
                    minRows={1}
                    maxRows={999}
                    value={text}
                    onKeyDown={this.handleKeyDown}
                    onMouseDown={this.swallowEvent}
                    onMouseUp={this.swallowEvent}
                    onChange={this.handleTextChange}
                    onBlur={() => { if (!this.justEscaped) onSave(example); }}
                    data-cy='example-text-editor-input'
                />
                {highlightEntities && <div className='highlight'>{this.highLightEntitiesInText()}</div>}
            </Form>
        );
    }
}

ExampleTextEditor.propTypes = {
    example: PropTypes.object,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    highlightEntities: PropTypes.bool,
    onCancel: PropTypes.func,
    autofocus: PropTypes.bool,
};

ExampleTextEditor.defaultProps = {
    example: emptyExample(),
    onChange: () => {},
    onSave: () => {},
    highlightEntities: true,
    onCancel: () => {},
    autofocus: true,
};

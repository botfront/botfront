import React from 'react';
import PropTypes from 'prop-types';
import { TextArea } from 'semantic-ui-react';
import { find, sortBy, isNull } from 'lodash';

import { examplePropType } from '../utils/ExampleUtils';
import getColor from '../../../lib/getColors';

const emptyExample = () => ({ text: '', intent: '', entities: [] });

export class ExampleTextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.inputSelectionRef = null; // reference to the parent of the example text input
        this.selectionAnchorRef = null; // reference to the example text input
        const { example } = props;
        this.state = { example };
    }

    componentDidMount() {
        const { highlightEntities, autofocus } = this.props;
        const { example } = this.state;
        if (autofocus) {
            this.inputSelectionRef.ref.current.focus();
            this.inputSelectionRef.ref.current.setSelectionRange(example.text.length, example.text.length);
        }

        if (highlightEntities) {
            // CREATE ENTITY LISTENER
            document.addEventListener('mouseup', this.mouseUpListener, false);
        }
    }

    componentDidUpdate(prevProps) {
        const { example } = this.state;
        const { example: exampleFromProps } = this.props;
        const { example: exampleFromPrevProps } = prevProps;
        if (exampleFromProps !== exampleFromPrevProps && exampleFromProps !== example) {
            this.setExample(exampleFromProps);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.mouseUpListener);
    }

    mouseUpListener = () => {
        const { disableNewEntities } = this.props;
        if (disableNewEntities) return;
        if (this.inputSelectionRef === null) return;
        const { example: { text } = {} } = this.state;
        const { anchorNode } = window.getSelection() || {};
        const { selectionStart: start, selectionEnd: end } = this.inputSelectionRef.ref.current || {};
        if (anchorNode === this.selectionAnchorRef && this.isValidEntity(start, end) && start < end) {
            const value = text.substring(start, end);
            this.insertEntity({
                value,
                start,
                end,
            });
        }
    }

    setExample = example => this.setState({ example });

    insertEntity = (fields) => {
        const { example, example: { entities } = {} } = this.state;
        const { onChange } = this.props;
        
        let entity = find(entities, { entity: '' });
        if (!entity) {
            entities.push({
                entity: '', value: '', start: 0, end: 0,
            });
            entity = find(entities, { entity: '' });
        }
        
        Object.assign(entity, fields);

        this.setState({ example });
        onChange(example);
    };

    isValidEntity = (start, end) => (
        (!this.getNextChar(end) || !this.getNextChar(end).match(/\w/)) // null value means last char
        && (!this.getPrevChar(start) || !this.getPrevChar(start).match(/\w/)) // null value means first char
    );

    getPrevChar = (selectionStart) => {
        const { example: { text } = {} } = this.state;
        if (selectionStart === 0) {
            return null;
        }
        return text.substring(selectionStart - 1, selectionStart);
    };

    getNextChar = (selectionEnd) => {
        const { example: { text } = {} } = this.state;
        if (selectionEnd === text.length - 1) {
            return null;
        }
        return text.substring(selectionEnd, selectionEnd + 1);
    };

    handleTextChange = (event) => {
        const { example } = this.state;
        const {
            onChange,
            example: {
                text: oldText,
                entities: oldEntities,
            } = {},
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
        const entities = oldEntities.map((entity) => {
            const changeSizeOld = changeEnd - changeBegin;
            const changeSizeNew = changeEndNew - changeBegin;
            const sizeChange = changeSizeNew - changeSizeOld;

            let { value, start, end } = entity;
            if (changeEnd <= start) { // Change is before entity begins
                start += sizeChange;
                end += sizeChange;
            } else if (changeBegin >= end) { // Change after copy ends
            } else if (changeBegin <= start && changeEnd >= end) { // Change consumes entity
                return null;
            } else if (changeBegin <= start && changeEnd >= start) { // Change cuts the beginning
                start = changeEndNew;
                end += sizeChange;
            } else if (changeEnd >= end && changeBegin <= end) { // Change cuts end
                end = changeBegin;
            } else { // Change is internal to the entity
                end += sizeChange;
            }

            if (start === end) {
                return null;
            }

            value = text.substring(start, end);
            return { ...entity, ...{ value, start, end } };
        }).filter(e => !isNull(e));

        // Update state
        const updatedExample = { ...example, text, entities };
        this.setState({ example: updatedExample });
        onChange(updatedExample);
    };

    handleBlur = () => {
        const { onBlur } = this.props;
        const { example } = this.state;
        onBlur(example);
    }

    highLightEntitiesInText = () => {
        const { example: { entities = [], text } = {} } = this.state;
        const sortedEntities = sortBy(entities.filter(e => !e.extractor || e.extractor === 'ner_crf'), 'start');
        const spans = [];
        sortedEntities.forEach((e, i) => {
            if (i === 0 && e.start > 0) spans.push(<span key='before-entities'>{text.substr(0, e.start)}</span>);
            spans.push(<span key={`${e.entity}-${i}`} style={{ ...getColor(e.entity) }}>{text.substr(e.start, e.end - e.start)}</span>);
            if (i < sortedEntities.length - 1) spans.push(<span key={`between-${e.entity}-${i}`}>{text.substr(e.end, sortedEntities[i + 1].start - e.end)}</span>);
            if (i === sortedEntities.length - 1) spans.push(<span key='after-entities'>{text.substr(e.end, e.value.length - e.end)}</span>);
        });
        return (
            <div className='highlight'>
                {spans}
            </div>
        );
    }

    handleKeyPress = (e) => {
        const { onEnter } = this.props;
        const { example } = this.state;
        if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter(example);
        }
    };

    render() {
        const { example: { text = '' } = {} } = this.state;
        const { highlightEntities, inline } = this.props;
        return (
            <div ref={(node) => { this.selectionAnchorRef = node; }} className='example-editor-container'>
                <TextArea
                    className={inline ? 'inline-example-editor' : ''}
                    ref={(node) => { this.inputSelectionRef = node; }}
                    name='text'
                    placeholder='User says...'
                    autoheight='true'
                    rows={(text && text.split('\n').length) || 1}
                    value={text}
                    onKeyPress={this.handleKeyPress}
                    onChange={this.handleTextChange}
                    onBlur={this.handleBlur}
                    data-cy='example-text-editor-input'
                />
                {highlightEntities && this.highLightEntitiesInText()}
            </div>
        );
    }
}

ExampleTextEditor.propTypes = {
    example: PropTypes.shape(examplePropType),
    onChange: PropTypes.func,
    onEnter: PropTypes.func,
    highlightEntities: PropTypes.bool,
    inline: PropTypes.bool,
    onBlur: PropTypes.func,
    autofocus: PropTypes.bool,
    disableNewEntities: PropTypes.bool,
};

ExampleTextEditor.defaultProps = {
    example: emptyExample(),
    onChange: () => {},
    onEnter: null,
    highlightEntities: true,
    inline: false,
    onBlur: () => {},
    autofocus: false,
    disableNewEntities: false,
};

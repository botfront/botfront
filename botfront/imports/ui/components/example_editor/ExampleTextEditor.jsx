import React from 'react';
import PropTypes from 'prop-types';
import { TextArea } from 'semantic-ui-react';
import { findDOMNode } from 'react-dom';
import _, { find, sortBy } from 'lodash';

import { examplePropType } from '../utils/ExampleUtils';
import getColor from '../../../lib/getColors';

const emptyExample = () => ({ text: '', intent: '', entities: [] });

export class ExampleTextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.selectionAnchorNode = null;
        this.inputNode = null;

        const { example } = props;
        this.state = { example };
    }

    componentDidMount() {
        const { highlightEntities } = this.props;

        if (highlightEntities) {
            document.addEventListener('mouseup', () => {
                const { example: { text } = {} } = this.state;
                const { anchorNode } = window.getSelection() || {};
                const { selectionStart: start, selectionEnd: end } = this.inputNode || {};
                if (anchorNode === this.selectionAnchorNode && this.isValidEntity() && start < end) {
                    const value = text.substring(start, end);
                    this.insertEntity({
                        value,
                        start,
                        end,
                    });
                }
            }, false);
        }
    }

    componentWillReceiveProps(props) {
        const { example } = props;
        this.setState({ example });
    }

    insertEntity = (fields) => {
        const { example, example: { entities } = {} } = this.state;
        const { onChange } = this.props;
        
        let entity = find(entities, { entity: '' });
        if (!entity) {
            entities.push({ entity: '', value: '', start: 0, end: 0 });
            entity = find(entities, { entity: '' });
        }
        
        Object.assign(entity, fields);

        this.setState({ example });
        onChange(example);
    };

    isValidEntity = () => (
        (!this.getNextChar() || this.getNextChar().match(/\w/)) // null value means last char
        && (!this.getPrevChar() || this.getPrevChar().match(/\w/)) // null value means first char
    );

    getPrevChar = () => {
        const { example: { text } = {} } = this.state;
        const { inputNode: { selectionStart } = {} } = this.inputNode || {};
        if (selectionStart === 0) {
            return null;
        }
        
        return text.substring(selectionStart - 1, selectionStart);
    };

    getNextChar = () => {
        const { example: { text } = {} } = this.state;
        const { inputNode: { selectionEnd } = {} } = this.inputNode || {};
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
        }).filter(e => !_.isNull(e));

        // Update state
        Object.assign(example, { text, entities });
        this.setState({ example });
        onChange(example);
    };

    highLightEntitiesInText = () => {
        const { example: { entities, text } = {} } = this.state;
        const sortedEntities = sortBy(entities.filter(e => !e.extractor || e.extractor === 'ner_crf'), 'start');
        const entityNames = sortedEntities.map(e => e.entity);
        const spans = [];
        sortedEntities.forEach((e, i) => {
            if (i === 0 && e.start > 0) spans.push(<span>{text.substr(0, e.start)}</span>);
            spans.push(<span style={{ ...getColor(entityNames.indexOf(e.entity)) }}>{text.substr(e.start, e.end - e.start)}</span>);
            if (i < sortedEntities.length - 1) spans.push(<span>{text.substr(e.end, sortedEntities[i + 1].start - e.end)}</span>);
            if (i === sortedEntities.length - 1) spans.push(<span>{text.substr(e.end, e.value.length - e.end)}</span>);
        });
        return (
            <div className='highlight'>
                {spans}
            </div>
        );
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.props.onEnter(); // eslint-disable-line
        }
    };

    render() {
        const { example: { text = '', entities = [] } = {} } = this.state;
        const { highlightEntities } = this.props;

        return (
            <div ref={node => this.selectionAnchorNode === node}>
                <TextArea
                    ref={node => this.inputNode === node && findDOMNode(node)}
                    name='text'
                    placeholder='User says...'
                    autoheight='true'
                    rows={1}
                    value={text}
                    onKeyPress={this.handleKeyPress}
                    onChange={this.handleTextChange}
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
};

ExampleTextEditor.defaultProps = {
    example: emptyExample(),
    onChange: () => {},
    onEnter: () => {},
    highlightEntities: true,
};

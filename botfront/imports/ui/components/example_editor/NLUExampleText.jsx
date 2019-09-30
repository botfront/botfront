import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label } from 'semantic-ui-react';
import { sortBy, isEmpty } from 'lodash';

import Entity from './Entity';
import getColor from '../../../lib/getColors';
import { examplePropType } from '../utils/ExampleUtils';
import EntityPopup from './EntityPopup';

class NLUExampleText extends React.Component {
    constructor(props) {
        super(props);

        this.textDiv = React.createRef();
        this.state = {
            stateEntity: null,
            selectedEntity: null,
        };
    }

    resetSelection = () => {
        this.setState({ selectedEntity: null });
    };

    getEntityLabelColor = (entity) => {
        const { color, entities } = this.props;
        return color || (entities && getColor(entities.indexOf(entity.entity), true)) || 'grey';
    };

    renderText = () => {
        const {
            example,
            entities,
            showLabels,
            disablePopup,
        } = this.props;
        const { stateEntity, selectedEntity } = this.state;

        let concatenatedEntities = example.entities;
        // Here we remove the duplicates between entities passed through props
        // And the entity in the state, this is useful when a saved entity is being edited
        if (stateEntity) {
            concatenatedEntities = concatenatedEntities.filter(
                entity => !(stateEntity.start === entity.start && stateEntity.end === entity.end),
            );
            concatenatedEntities = concatenatedEntities.concat([stateEntity]);
        }

        if (selectedEntity) concatenatedEntities = concatenatedEntities.concat([selectedEntity]);

        const copy = sortBy(concatenatedEntities, [
            'start',
            function(o) {
                return -o.end;
            },
        ]).slice();
        const jsx = [];

        function gatherStarts(list, start) {
            // returns a list of entities that start at position specified
            // REQUIRES ORDERED
            const starts = [];
            while (!!list.length && list[0].start === start) {
                starts.push(list.shift());
            }

            return starts;
        }

        function collectEnds(list, end) {
            const endsIndex = [];
            list.forEach((e, i) => {
                if (e.end === end) {
                    endsIndex.push(i);
                }
            });

            let ends = [];
            sortBy(endsIndex, i => -i).forEach((i) => {
                ends = ends.concat(list.splice(i, 1));
            });

            return ends;
        }

        let index = 0;
        let activeEntities = [];
        let prevIndex = 0; // Used for top-level only

        while (index < example.text.length) {
            const starts = !!copy ? gatherStarts(copy, index) : [];
            if (starts.length && activeEntities.length === 0) {
                jsx.push(example.text.substring(prevIndex, index));
                prevIndex = index;
            }

            activeEntities = activeEntities.concat(starts);
            let options = [];
            if (starts.length) {
                options = entities.map(ent => ({
                    text: ent,
                    value: ent,
                }));
            }

            // Notice the keys in the items below, this ensures uniqueness
            // if we used list index, there would have been conflict when adding a popup for selected text

            // eslint-disable-next-line no-loop-func
            starts.forEach((e) => {
                if (e.selection) {
                    jsx.push(
                        <EntityPopup
                            entity={e}
                            options={options}
                            onAddOrChange={(event, data) => this.handleSaveEntity(e, data)}
                            length={e.value.length}
                            onSelectionReset={this.resetSelection}
                            trigger={(
                                <span style={{ backgroundColor: 'rgba(164, 41, 203, 0.3)' }}>
                                    {e.value}
                                </span>
                            )}
                            key={`${e.start}${e.end}`}
                            selection
                            disabled={disablePopup}
                        />,
                    );
                } else {
                    jsx.push(
                        <EntityPopup
                            entity={e}
                            onAddOrChange={(event, data) => this.handleSaveEntity(e, data)
                            }
                            onDelete={() => this.handleDeleteEntity(e)}
                            options={options}
                            deletable
                            length={example.text.slice(e.start, e.end).length}
                            trigger={(
                                <Entity
                                    entity={e}
                                    text={example.text.slice(e.start, e.end)}
                                    colour={disablePopup ? 'grey' : this.getEntityLabelColor(e)}
                                    showLabel={showLabels}
                                />
                            )}
                            key={`${e.start}${e.end}`}
                            disabled={disablePopup}
                        />,
                    );
                }
            });

            const ends = collectEnds(activeEntities, index);

            if (ends.length && activeEntities.length === 0) {
                prevIndex = index;
            }

            index += 1;
        }

        if (activeEntities.length === 0) {
            jsx.push(example.text.substring(prevIndex));
        }

        return jsx;
    };

    getIntentName = (intent) => {
        if (typeof intent === 'string' || intent instanceof String) {
            return intent;
        }
        return intent.name;
    };

    // window.getSelection only returns the node of the selected text, it might not be the first one
    // so we use this function to compute the offset of the selection using the other nodes
    computeSelectionOffset = (selectedNode, textNodes) => {
        let offset = 0;
        textNodes.forEach((node, index) => {
            if (node.isEqualNode(selectedNode)) {
                textNodes.forEach((node2, index2) => {
                    if (index2 === 0) return;
                    if (index2 >= index) return;
                    if (node2.nodeType === 3) {
                        offset += parseInt(node2.length, 10);
                    } else if (node2.childNodes[0] && node2.attributes.getNamedItem('length')) {
                        offset += parseInt(node2.attributes.getNamedItem('length').value, 10);
                    }
                });
            }
        });
        return offset;
    };

    handleSaveEntity = (entity, { value }) => {
        const { onSave, example } = this.props;
        let { entities } = example;
        let newEntity = true;
        entities = entities.map((ent) => {
            if (ent.start === entity.start && ent.end === entity.end) {
                newEntity = false;
                return {
                    ...ent,
                    entity: value,
                };
            }
            return ent;
        });

        this.setState({
            stateEntity: null,
            selectedEntity: null,
        });

        const newExample = {
            ...example,
            entities: newEntity
                ? entities.concat([
                    {
                        start: entity.start,
                        end: entity.end,
                        value: entity.value,
                        entity: value,
                    },
                ])
                : entities,
        };

        onSave(newExample, () => {});
    };

    handleDeleteEntity = (entity) => {
        const { onSave, example } = this.props;
        onSave(
            {
                ...example,
                entities: example.entities.filter(
                    e => !(e.start === entity.start && e.end === entity.end),
                ),
            },
            () => {},
        );
    };

    handleTextMouseUp = () => {
        const { editable, example } = this.props;
        if (!editable) return;
        const selection = window.getSelection();
        const offset = this.computeSelectionOffset(
            selection.baseNode,
            this.textDiv.current.childNodes,
        );
        const anchor = Math.min(selection.anchorOffset, selection.extentOffset) + offset;
        const extent = Math.max(selection.anchorOffset, selection.extentOffset) + offset;
        const selectionText = this.getCorrectSelection(example.text, anchor, extent);
        if (
            selection.baseNode
            && selectionText
            && this.textDiv.current.isEqualNode(selection.baseNode.parentElement)
            && selection.toString().length > 0
        ) {
            this.setState({
                selectedEntity: {
                    value: example.text.slice(selectionText.anchor, selectionText.extent),
                    start: selectionText.anchor,
                    end: selectionText.extent,
                    entity: '',
                    selection: true,
                },
            });
            selection.removeAllRanges();
        }
    };

    getCorrectSelection = (text, anchor, extent) => {
        if (anchor === extent) {
            return false;
        }

        // we check that the characters at the edge of the selection are either
        // next to a non word character or at the edge of the text
        // the regex [a-zA-Z\u00C0-\u017F0-9-] match all letters, numbers, the accentuated characters range 192 to 383 and -
        const anchorCorrect = (anchor === 0 || /\W/.test(text.slice(anchor - 1, anchor)))
            && /[a-zA-Z\u00C0-\u017F0-9-]/.test(text.slice(anchor, anchor + 1));
        const extentCorrect = (extent === text.length || /\W/.test(text.slice(extent, extent + 1)))
            && /[a-zA-Z\u00C0-\u017F0-9-]/.test(text.slice(extent - 1, extent));

        if (anchorCorrect && extentCorrect) {
            return {
                anchor,
                extent,
            };
        }

        let trimmedAnchor = anchor;
        let trimmedExtent = extent;

        if (!anchorCorrect) {
            trimmedAnchor = this.trimBeginning(text, anchor, extent);
        }

        if (!extentCorrect) {
            trimmedExtent = this.trimEnding(text, anchor, extent);
        }

        if ((!trimmedAnchor && trimmedAnchor !== 0) || !trimmedExtent) {
            return false;
        }

        return {
            anchor: trimmedAnchor,
            extent: trimmedExtent,
        };
    };

    // This function recursively removes the first non-word characters of a selection
    // until it starts with a word character
    trimBeginning = (text, anchor, extent) => {
        if (
            anchor === extent
            || (/[a-zA-Z\u00C0-\u017F0-9-]/.test(text.slice(anchor, anchor + 1)) && /[a-zA-Z\u00C0-\u017F0-9-]/.test(text.slice(anchor - 1, anchor)))
        ) {
            return false;
        }

        if (
            /[a-zA-Z\u00C0-\u017F0-9-]/.test(text.slice(anchor, anchor + 1))
            && /\W/.test(text.slice(anchor - 1, anchor))
        ) {
            return anchor;
        }

        return this.trimBeginning(text, anchor + 1, extent);
    };

    // This function recursively removes the last non-word characters of a selection
    // until it ends with a word character
    trimEnding = (text, anchor, extent) => {
        if (
            anchor === extent
            || (/[a-zA-Z\u00C0-\u017F0-9-]/.test(text.slice(extent - 1, extent)) && /[a-zA-Z\u00C0-\u017F0-9-]/.test(text.slice(extent, extent + 1)))
        ) {
            return false;
        }

        if (
            /[a-zA-Z\u00C0-\u017F0-9-]/.test(text.slice(extent - 1, extent))
            && /\W/.test(text.slice(extent, extent + 1))
        ) {
            return extent;
        }

        return this.trimEnding(text, anchor, extent - 1);
    };

    render() {
        const { withMargin, example, showIntent } = this.props;
        const { stateEntity, selectedEntity } = this.state;
        return (
            <div style={{ position: 'relative' }}>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span
                    className={withMargin ? ' with_margin' : ''}
                    ref={this.textDiv}
                    onMouseUp={this.handleTextMouseUp}
                    style={{ whiteSpace: 'normal', lineHeight: '2.4em' }}
                >
                    <Icon name='quote left' size='small' />
                    {isEmpty(example.entities) && !stateEntity && !selectedEntity
                        ? example.text
                        : this.renderText()}
                    {example.intent && showIntent && (
                        <Label
                            basic
                            size='small'
                            horizontal
                            color='purple'
                            pointing='left'
                            style={{ display: 'inline-flex', borderRadius: '0.15rem' }}
                        >
                            {this.getIntentName(example.intent)}
                        </Label>
                    )}
                </span>
            </div>
        );
    }
}

NLUExampleText.propTypes = {
    example: PropTypes.shape(examplePropType).isRequired,
    entities: PropTypes.arrayOf(PropTypes.string),
    color: PropTypes.string,
    showIntent: PropTypes.bool,
    showLabels: PropTypes.bool,
    withMargin: PropTypes.bool,
    onSave: PropTypes.func,
    editable: PropTypes.bool,
    disablePopup: PropTypes.bool,
};

NLUExampleText.defaultProps = {
    entities: [],
    color: null,
    showIntent: false,
    showLabels: false,
    withMargin: false,
    editable: false,
    disablePopup: false,
    onSave: () => {},
};

export default NLUExampleText;

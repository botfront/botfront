import React from 'react';
import Tree from '@atlaskit/tree';
import { DragDropContext, Droppable } from 'react-beautiful-dnd-next';

export default class EmbeddedTree extends Tree {
    // https://github.com/atlassian/react-beautiful-dnd/issues/1237#issuecomment-527778465
    handleOnDragStart = () => {
        const { id, onDragStart } = this.props;
        // https://github.com/atlassian/react-beautiful-dnd/issues/131#issuecomment-589536751
        const treeContainer = document.getElementById(id);
        if (!treeContainer) return;
        onDragStart();
        const draggables = [...treeContainer.querySelectorAll('[data-react-beautiful-dnd-draggable]')];
        const draggedItem = draggables.find(elem => elem.style.position === 'fixed');
        if (!draggedItem) return;
        const { top, left: offsetLeft } = treeContainer.getBoundingClientRect();
        const offsetTop = top - treeContainer.scrollTop;
        draggedItem.style.top = `${parseInt(draggedItem.style.top, 10) - offsetTop}px`;
        draggedItem.style.left = `${parseInt(draggedItem.style.left, 10) - offsetLeft}px`;
    };

    render() {
        const { isNestingEnabled } = this.props;
        const renderedItems = this.renderItems();

        return (
            <DragDropContext
                onDragStart={this.handleOnDragStart}
                onDragEnd={this.onDragEnd}
                onDragUpdate={this.onDragUpdate}
            >
                <Droppable
                    droppableId='tree'
                    isCombineEnabled={isNestingEnabled}
                    ignoreContainerClipping
                >
                    {(dropProvided) => {
                        const finalProvided = this.patchDroppableProvided(dropProvided);
                        return (
                            <div
                                ref={finalProvided.innerRef}
                                style={{ pointerEvents: 'auto' }}
                                onTouchMove={this.onPointerMove}
                                onMouseMove={this.onPointerMove}
                                {...finalProvided.droppableProps}
                            >
                                {renderedItems}
                                {dropProvided.placeholder}
                            </div>
                        );
                    }}
                </Droppable>
            </DragDropContext>
        );
    }
}

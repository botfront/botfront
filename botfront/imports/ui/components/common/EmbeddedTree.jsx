import React from 'react';
import Tree from '@atlaskit/tree';
import { DragDropContext, Droppable } from 'react-beautiful-dnd-next';

export default class EmbeddedTree extends Tree {
    componentDidMount = () => {
        const { id } = this.props;
        this.treeContainer = document.getElementById(id);
        this.lastScrollTop = this.treeContainer.scrollTop;
        this.treeContainer.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount = () => this.treeContainer.removeEventListener('scroll', this.handleScroll);

    handleScroll = () => {
        const { scrollTop } = this.treeContainer;
        const scrollDelta = this.lastScrollTop - scrollTop;
        this.lastScrollTop = scrollTop;
        this.correctOffset({ left: 0, top: scrollDelta });
    }

    correctOffset = (deltas) => {
        // https://github.com/atlassian/react-beautiful-dnd/issues/131#issuecomment-589536751
        if (!this.treeContainer) return;
        const draggables = [...this.treeContainer.querySelectorAll('[data-react-beautiful-dnd-draggable]')];
        const draggedItem = draggables.find(elem => elem.style.position === 'fixed');
        if (!draggedItem) return;
        let { left: offsetLeft, top: offsetTop } = deltas || {};
        if (!deltas) {
            const { top, left } = this.treeContainer.getBoundingClientRect();
            offsetTop = top - this.lastScrollTop;
            offsetLeft = left;
        }
        if (offsetTop) draggedItem.style.top = `${parseInt(draggedItem.style.top, 10) - offsetTop}px`;
        if (offsetLeft) draggedItem.style.left = `${parseInt(draggedItem.style.left, 10) - offsetLeft}px`;
    }

    handleOnDragStart = () => {
        const { onDragStart } = this.props;
        onDragStart();
        this.correctOffset();
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
                        // https://github.com/atlassian/react-beautiful-dnd/issues/1237#issuecomment-527778465
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

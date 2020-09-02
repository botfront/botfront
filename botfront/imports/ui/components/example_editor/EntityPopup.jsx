import {
    Grid, Button, Popup, Header, Icon,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

import EntityDropdown from '../nlu/common/EntityDropdown';
import { entityPropType } from '../utils/EntityUtils';

class EntityPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDeleteConfirmation: false,
            open: false,
        };
        this.entityNode = React.createRef();
        this.popupNode = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        window.addEventListener('scroll', this.handleScroll, true);
        window.addEventListener('keydown', this.handleKeyDown, true);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        window.removeEventListener('scroll', this.handleScroll, true);
        window.removeEventListener('keydown', this.handleKeyDown, true);
        clearTimeout(this.mouseLeaveTimer);
    }

    handleDeleteClick = () => {
        this.setState({ showDeleteConfirmation: true });
    };

    closeModal = () => {
        const { onSelectionReset } = this.props;
        onSelectionReset();
        this.setState({ open: false });
    }

    handleScroll = (event) => {
        if (this.popupNode.current && !this.popupNode.current.contains(event.target)) {
            this.closeModal();
        }
    };

    handleKeyDown = (event) => {
        if (event.key === 'Escape') this.closeModal();
    };

    handleClickOutside = (event) => {
        const { onSelectionReset } = this.props;
        if (
            this.entityNode.current
            && !this.entityNode.current.contains(event.target)
            && (!this.popupNode.current || !this.popupNode.current.contains(event.target))
        ) {
            this.setState({ open: false, showDeleteConfirmation: false });
            onSelectionReset();
        }
    };

    handleMouseEnter = () => {
        clearTimeout(this.mouseLeaveTimer);
        this.setState({ open: true });
    };

    handleMouseLeave = () => {
        // The time in ms before the component actually close the popup
        // this is useful for allowing the user to put his mouse on the popup before it closes.
        // reduce this value to improve responsiveness, but this will reduce the time the user
        // has to move his mouse to the popup.
        const leaveTime = 35;

        this.mouseLeaveTimer = setTimeout(() => {
            // this lets the user time to put his mouse on the popup after leaving the label
            this.setState({ open: false });
        }, leaveTime);
    };

    getContent = () => {
        const {
            deletable, onDelete, entity, onAddOrChange,
        } = this.props;
        const { showDeleteConfirmation } = this.state;

        return (
            <Grid columns='1'>
                <Grid.Row centered style={{ padding: '0.9em 0 0.4em 0' }}>
                    <Header as='h4' style={{ fontWeight: '300' }}>
                        {deletable ? 'Change' : 'Add'} entity
                    </Header>
                </Grid.Row>
                <Grid.Row style={{ padding: '0 0.7em' }}>
                    {(deletable && !showDeleteConfirmation) ? (
                        <>
                            <Grid.Column width='14' style={{ padding: '0' }}>
                                <EntityDropdown
                                    entity={entity}
                                    onAddItem={onAddOrChange}
                                    onChange={onAddOrChange}
                                />
                            </Grid.Column>
                            <Grid.Column width='2' style={{ padding: '0' }}>
                                <Icon
                                    link
                                    name='trash'
                                    color='grey'
                                    onClick={this.handleDeleteClick}
                                    style={{ padding: '15px 0 0 8px' }}
                                />
                            </Grid.Column>
                        </>
                    ) : (
                        <EntityDropdown
                            entity={entity}
                            onAddItem={onAddOrChange}
                            onChange={onAddOrChange}
                        />
                    )}
                </Grid.Row>
                {showDeleteConfirmation ? (
                    <Grid.Row centered>
                        <Button negative size='mini' onClick={onDelete}>
                            Confirm deletion
                        </Button>
                    </Grid.Row>
                ) : (
                    // Here for styling purposes
                    <div style={{ height: '10px' }} />
                )}
            </Grid>
        );
    };

    render() {
        const {
            trigger,
            selection,
            length,
            disabled,
        } = this.props;
        const { open } = this.state;
        return (
            <span
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                length={length}
                ref={this.entityNode}
            >
                <Popup
                    trigger={trigger}
                    content={(
                        <div
                            onMouseEnter={this.handleMouseEnter}
                            onMouseLeave={this.handleMouseLeave}
                            {...{ onMouseDown: (e) => { e.preventDefault(); e.stopPropagation(); } }}
                            ref={this.popupNode}
                        >
                            {this.getContent()}
                        </div>
                    )}
                    position='top center'
                    open={selection || open}
                    disabled={disabled}
                    className='entity-popup'
                />
            </span>
        );
    }
}

EntityPopup.propTypes = {
    deletable: PropTypes.bool,
    onDelete: PropTypes.func,
    entity: PropTypes.shape(entityPropType).isRequired,
    onAddOrChange: PropTypes.func.isRequired,
    trigger: PropTypes.element.isRequired,
    selection: PropTypes.bool,
    onSelectionReset: PropTypes.func,
    length: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
};

EntityPopup.defaultProps = {
    deletable: false,
    onDelete: () => {},
    selection: false,
    onSelectionReset: () => {},
    disabled: false,
};

export default EntityPopup;

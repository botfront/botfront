import React from 'react';
import PropTypes from 'prop-types';
import {
    Segment,
    Breadcrumb,
    Icon,
    Menu,
    Dropdown,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import StoryPathPopup from './StoryPathPopup.jsx';
import { ConversationOptionsContext } from './Context';
import { can } from '../../../lib/scopes';

class StoryFooter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderPath = () => {
        const { storyPath } = this.props;
        let pathBreadcrumbs = [];
        // we create that shallow copy, because we may need to modify it if it is too long
        let computedStoryPath = [...storyPath];
        const maxLength = 5;

        if (storyPath.length > maxLength) {
            computedStoryPath = storyPath.slice(storyPath.length - maxLength, storyPath.length);
            pathBreadcrumbs = [
                ...pathBreadcrumbs,
                <StoryPathPopup
                    key='ellipsis'
                    storyPath={storyPath.join('>')}
                    trigger={(
                        <Breadcrumb.Section className='collapsed-path'>
                            <Icon disabled color='grey' name='ellipsis horizontal' size='small' />
                        </Breadcrumb.Section>
                    )}
                />,
                <Breadcrumb.Divider key='ellipsis-divider'>{' > '}</Breadcrumb.Divider>,
            ];
        }
        computedStoryPath.forEach((location, index) => {
            pathBreadcrumbs = [
                ...pathBreadcrumbs,
                <Breadcrumb.Section key={`popup-location-${index}`}>{location}</Breadcrumb.Section>,
                <Breadcrumb.Divider key={`popup-divider-${index}`}>{'>'}</Breadcrumb.Divider>,
            ];
        });
        // remove the latest divider, as we don't want to display it
        pathBreadcrumbs.pop();
        return pathBreadcrumbs;
    };

    handleBranchClick = () => {
        const { onBranch, canBranch } = this.props;
        if (canBranch) {
            onBranch();
        }
    };

    handlerContinueClick = () => {
        const { onContinue } = this.props;
        onContinue();
    };

    selectIconColor = (active) => {
        if (active) {
            return 'blue';
        }
        return 'grey';
    }

    selectMenuClass = () => {
        const { canContinue } = this.props;
        if (canContinue) {
            return '';
        }
        return ' linked';
    }

    filterDestinations = (data, currentStoryId) => data.filter((story) => {
        if (story._id === currentStoryId) {
            if (story.branches && story.branches.length > 0 && !(story.rules && story.rules.length > 0)) return true;
            return false;
        }
        if (story.smart) return false;
        if (story.rules && story.rules.length > 0) return false;
        return true;
    }).map(({ value, text }) => ({ value, text }));


    renderContinue = () => {
        const { canContinue, disableContinue } = this.props;
        if (disableContinue) {
            return <></>;
        }
        if (canContinue) {
            return (
                <Menu.Item className='footer-option-button' onClick={this.handlerContinueClick}>
                    <Icon name='arrow alternate circle right outline' color='blue' />
                    Connect
                </Menu.Item>
            );
        }
        return (
            <Menu.Item className='footer-option-button' onClick={this.handlerContinueClick}>
                <Icon className='long' name='arrow alternate circle right outline' color='blue' />
                Continue To Linked Story
            </Menu.Item>
        );
    }

    renderBranchMenu = (destinationStory, canBranch) => {
        const { projectId } = this.props;
        if (destinationStory) {
            return <></>;
        }
        return (
            <Menu.Item
                onClick={this.handleBranchClick}
                className={`footer-option-button color-${this.selectIconColor(
                    canBranch,
                )}`}
                data-cy='create-branch'
            >
                <Icon
                    disabled={!canBranch}
                    name='code branch'
                    color={this.selectIconColor(canBranch)}
                />
                Branch Story
            </Menu.Item>
        );
    }

    renderLinkMenu = (destinationStory, onDestinationStorySelection, canBranch, stories, currentStoryId) => (
        <Menu.Item
            className={`footer-option-button remove-padding color-${this.selectIconColor(
                canBranch,
            )}`}
            data-cy='link-to'
            position={this.positionStoryLinker(destinationStory)}
        >
            <Icon
                disabled={!canBranch}
                name='arrow right'
                color='green'
            />
            Link&nbsp;to:
            <Dropdown
                placeholder='Select story'
                value={destinationStory ? destinationStory._id : ''}
                fluid
                search
                selection
                clearable
                selectOnBlur={false}
                className='stories-linker'
                options={this.filterDestinations(stories, currentStoryId)}
                data-cy='stories-linker'
                disabled={!canBranch}
                onChange={onDestinationStorySelection}
            />
        </Menu.Item>
    )


    positionStoryLinker = destinationStory => (destinationStory === null ? 'right' : 'left');

    render() {
        const {
            canBranch,
            stories,
            currentStoryId,
            destinationStory,
            onDestinationStorySelection,
            projectId,
        } = this.props;
        return (
            <Segment data-cy='story-footer' className={`footer-segment ${destinationStory === null ? '' : 'linked'}`} size='mini' attached='bottom'>
                <div className='breadcrumb-container'>{this.renderPath()}</div>
                <Menu fluid size='mini' borderless>
                    <>{can('stories:w', projectId) && this.renderBranchMenu(destinationStory, canBranch)}</>
                    <>{can('stories:w', projectId) && canBranch ? this.renderLinkMenu(destinationStory, onDestinationStorySelection, canBranch, stories, currentStoryId) : null}</>
                    <>{this.renderContinue()}</>
                </Menu>
            </Segment>
        );
    }
}

StoryFooter.propTypes = {
    storyPath: PropTypes.array,
    canBranch: PropTypes.bool,
    currentStoryId: PropTypes.string.isRequired,
    canContinue: PropTypes.bool,
    onBranch: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onDestinationStorySelection: PropTypes.func.isRequired,
    disableContinue: PropTypes.bool,
    stories: PropTypes.array.isRequired,
    destinationStory: PropTypes.object,
    projectId: PropTypes.string.isRequired,
};

StoryFooter.defaultProps = {
    storyPath: [],
    canBranch: true,
    canContinue: true,
    disableContinue: true,
    destinationStory: null,
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

const ConnectedStoryFooter = connect(mapStateToProps)(StoryFooter);

export default props => (
    <ConversationOptionsContext.Consumer>
        {value => (
            <ConnectedStoryFooter
                {...props}
                stories={value.stories}
            />
        )}
    </ConversationOptionsContext.Consumer>
);

import React from 'react';
import PropTypes from 'prop-types';
import {
    Segment,
    Breadcrumb,
    Icon,
    Menu,
    Dropdown,
} from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import StoryPathPopup from './StoryPathPopup.jsx';
import { ConversationOptionsContext } from '../utils/Context';

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

    reshapeStoriesData = data => data.map(story => ({ key: story._id, text: story.title, value: story._id }));


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

    renderBranchMenu = (linkedTo, canBranch) => {
        if (linkedTo) {
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

    renderLinkMenu = (linkedTo, canBranch, stories) => (
        <Menu.Item
            className={`footer-option-button remove-padding color-${this.selectIconColor(
                canBranch,
            )}`}
            data-cy='link-to'
            position={this.positionStoryLinker(linkedTo)}
        >
            <Icon
                disabled={!canBranch}
                name='arrow right'
                color='green'
            />
            Link&nbsp;to:
            <Dropdown
                placeholder='Select story'
                value={linkedTo ? linkedTo._id : ''}
                fluid
                search
                selection
                clearable
                selectOnBlur={false}
                className='stories-linker'
                options={this.reshapeStoriesData(stories)}
                data-cy='stories-linker'
                disabled={!canBranch}
                onChange={this.storySelection}
            />

        </Menu.Item>);


    positionStoryLinker = linkedTo => (linkedTo === undefined ? 'right' : 'left');

    storySelection = (story, { value }) => {
        const { branchPath } = this.props;
        Meteor.call('stories.addCheckpoints', value, branchPath);
    };


    render() {
        const { canBranch, stories, branchPath } = this.props;
        const linkedTo = stories.find(story => (story.checkpoints !== undefined ? story.checkpoints.some(checkpoint => checkpoint.includes(branchPath[branchPath.length - 1])) : false));
        return (
            <Segment data-cy='story-footer' className={`footer-segment ${linkedTo === undefined ? '' : 'linked'}`} size='mini' attached='bottom'>
                <div className='breadcrumb-container'>{this.renderPath()}</div>
                <Menu fluid size='mini' borderless>
                    <>{this.renderBranchMenu(linkedTo, canBranch)}</>
                    <>{this.renderLinkMenu(linkedTo, canBranch, stories)}</>
                    <>{this.renderContinue()}</>
                </Menu>
            </Segment>
        );
    }
}

StoryFooter.propTypes = {
    storyPath: PropTypes.array,
    canBranch: PropTypes.bool,
    branchPath: PropTypes.array,
    canContinue: PropTypes.bool,
    onBranch: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    disableContinue: PropTypes.bool,
    stories: PropTypes.array.isRequired,
};

StoryFooter.defaultProps = {
    storyPath: [],
    branchPath: [],
    canBranch: true,
    canContinue: true,
    disableContinue: true,
};

export default props => (
    <ConversationOptionsContext.Consumer>
        {value => (
            <StoryFooter
                {...props}
                stories={value.stories}
            />
        )}
    </ConversationOptionsContext.Consumer>
);

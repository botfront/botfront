import React from 'react';
import PropTypes from 'prop-types';
import {
    Segment,
    Breadcrumb,
    Icon,
    Menu,
} from 'semantic-ui-react';

import StoryPathPopup from './StoryPathPopup.jsx';

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


    render() {
        const { canBranch } = this.props;
        return (
            <Segment className='footer-segment' size='mini' attached='bottom'>
                <div className='breadcrumb-container'>{this.renderPath()}</div>
                <Menu fluid size='mini' borderless>
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
                    <>{this.renderContinue()}</>
                </Menu>
            </Segment>
        );
    }
}

StoryFooter.propTypes = {
    storyPath: PropTypes.array,
    canBranch: PropTypes.bool,
    canContinue: PropTypes.bool,
    onBranch: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    disableContinue: PropTypes.bool,
};

StoryFooter.defaultProps = {
    storyPath: [],
    canBranch: true,
    canContinue: true,
    disableContinue: true,
};

export default StoryFooter;

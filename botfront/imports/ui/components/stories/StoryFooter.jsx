import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Breadcrumb, Icon } from 'semantic-ui-react';

import './style.import.less';

import StoryPathPopup from './StoryPathPopup.jsx';

class StoryFooter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderPath = () => {
        const { storyPath } = this.props;
        let pathArray = storyPath.split('__');
        const pathBreadcrumbs = [];
        const maxLength = 5;

        if (pathArray.length > 3) {
            pathBreadcrumbs.push();
            pathArray = pathArray.slice(pathArray.length - maxLength, pathArray.length);
            pathBreadcrumbs.push(
                <StoryPathPopup
                    storyPath={storyPath}
                    trigger={(
                        <Breadcrumb.Section className='collapsed-path'>
                            <Icon disabled color='grey' name='ellipsis horizontal' size='large' />
                        </Breadcrumb.Section>
                    )}
                />,
            );
            pathBreadcrumbs.push(<Breadcrumb.Divider>{'>'}</Breadcrumb.Divider>);
        }
        pathArray.forEach((location) => {
            pathBreadcrumbs.push(<Breadcrumb.Section>{location}</Breadcrumb.Section>);
            pathBreadcrumbs.push(<Breadcrumb.Divider>{'>'}</Breadcrumb.Divider>);
        });
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
        const { onContinue, canContinue } = this.props;
        if (canContinue) {
            onContinue();
        }
    };

    selectIconColor = (active) => {
        if (active) {
            return 'blue';
        }
        return 'grey';
    }

    renderContinue = () => {
        const { canContinue } = this.props;
        if (canContinue) {
            return (
                <Segment className='footer-option-button' onClick={this.handlerContinueClick}>
                    <Icon name='arrow alternate circle right outline' color='blue' />
                    Connect
                </Segment>
            );
        }
        return (
            <Segment className='footer-option-button long' onClick={this.handlerContinueClick}>
                <Icon className='long' name='arrow alternate circle right outline' color='blue' />
                Continue To Linked Story
            </Segment>
        );
    }

    render () {
        const {
            canBranch,
        } = this.props;
        return (
            <Segment.Group className='footer-segment' horizontal>
                <Segment className='breadcrumb-container'>{this.renderPath()}</Segment>
                <Segment className='footer-option-button' disabled={!canBranch} onClick={this.handleBranchClick}>
                    <Icon disabled={!canBranch} name='code branch' color={this.selectIconColor(canBranch)} />
                    Branch
                </Segment>
                <>
                    {this.renderContinue()}
                </>
            </Segment.Group>
        );
    }
}

StoryFooter.propTypes = {
    storyPath: PropTypes.string,
    canBranch: PropTypes.bool,
    canContinue: PropTypes.bool,
    onBranch: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
};

StoryFooter.defaultProps = {
    storyPath: '',
    canBranch: true,
    canContinue: true,
};

export default StoryFooter;

import {
    Menu, Icon,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';


class IntroStorySubMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            introStory,
            introClick,
            introStoryClick,
            isSelected,
        } = this.props;
        return (
            <Menu
                vertical
                fluid
                onClick={introStoryClick}
                className={`intro-story ${
                    isSelected ? 'selected-intro-story' : ''
                }`}
            >
                <Menu.Item
                    active={isSelected}
                    link
                    data-cy='intro-story-group'
                >
                    <Icon
                        id={`${
                            introStory && introStory.selected
                                ? 'selected'
                                : 'not-selected'
                        }`}
                        name='eye'
                        onClick={e => introClick(e, introStory)}
                    />
                    <span>Intro stories</span>
                </Menu.Item>
            </Menu>
        );
    }
}

IntroStorySubMenu.propTypes = {
    introStory: PropTypes.object.isRequired,
    introClick: PropTypes.func.isRequired,
    introStoryClick: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,

};

IntroStorySubMenu.defaultProps = {
};


export default IntroStorySubMenu;

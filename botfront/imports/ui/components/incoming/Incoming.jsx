import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { Container, Menu } from 'semantic-ui-react';
import { browserHistory } from 'react-router';

import LanguageDropdown from '../common/LanguageDropdown';
import Activity from '../nlu/activity/Activity';
import ActivityInsertions from '../nlu/activity/ActivityInsertions';
import ConversationBrowser from '../conversations/ConversationsBrowser';
import { updateIncomingPath } from './incoming.utils';
import { ProjectContext } from '../../layouts/context';

export default function Incoming(props) {
    const { router } = props;
    const [activeTab, setActiveTab] = useState(router.params.tab || 'newutterances');
    const {
        project: { _id: projectId },
        language: workingLanguage,
    } = useContext(ProjectContext);

    const linkToEvaluation = () => {
        router.push({
            pathname: `/project/${projectId}/nlu/model/${workingLanguage}`,
            state: { isActivityLinkRender: true },
        });
    };

    const handleTabClick = (itemKey) => {
        setActiveTab(itemKey);
        const url = updateIncomingPath({ ...router.params, tab: itemKey });
        if (router.params.tab === url) return;
        browserHistory.push({ pathname: url });
    };

    const renderPageContent = () => {
        switch (activeTab) {
        case 'newutterances':
            return <Activity linkRender={linkToEvaluation} />;
        case 'conversations':
            return <ConversationBrowser />;
        case 'populate':
            return <ActivityInsertions />;
        default:
            return <></>;
        }
    };

    const renderTabs = () => (
        [
            { value: 'newutterances', text: 'New Utterances' },
            { value: 'conversations', text: 'Conversations' },
            { value: 'populate', text: 'Populate' },
        ].map(({ value, text }) => (
            <Menu.Item
                content={text}
                key={value}
                data-cy={value}
                active={value === activeTab}
                onClick={() => handleTabClick(value)}
            />
        ))
    );

    return (
        <>
            <Menu borderless className='top-menu'>
                <div className='language-container'>
                    <Menu.Item header className='language-item'>
                        {['conversations', 'forms'].includes(activeTab)
                            ? null
                            : <LanguageDropdown />
                        }
                    </Menu.Item>
                </div>
                <div className='incoming-tabs'>
                    {renderTabs()}
                </div>
            </Menu>
            <div>
                <Container>{renderPageContent()}</Container>
            </div>
        </>
    );
}

Incoming.propTypes = {
    router: PropTypes.object,
};

Incoming.defaultProps = {
    router: {},
};

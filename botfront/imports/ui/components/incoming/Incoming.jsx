import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { Container, Menu } from 'semantic-ui-react';
import { browserHistory } from 'react-router';

import LanguageDropdown from '../common/LanguageDropdown';
import EnvSelector from '../common/EnvSelector';
import { PageMenu } from '../utils/Utils';
import Activity from '../nlu/activity/Activity';
import ActivityInsertions from '../nlu/activity/ActivityInsertions';
import ConversationsBrowserContainer from '../conversations/ConversationsBrowserContainer';
import FormResults from './FormResults';
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
            return (
                <ConversationsBrowserContainer />
            );
        case 'forms':
            return (
                <FormResults />
            );
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
            { value: 'forms', text: 'Form results' },
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
            <PageMenu>
                <Menu.Item>
                    {['populate'].includes(activeTab) ? (
                        <></>
                    ) : (
                        <EnvSelector />
                    )}
                </Menu.Item>
                <Menu.Item>
                    {['conversations', 'forms'].includes(activeTab)
                        ? null
                        : <LanguageDropdown />
                    }
                </Menu.Item>
                <Menu.Item>
                    {renderTabs()}
                </Menu.Item>
            </PageMenu>
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

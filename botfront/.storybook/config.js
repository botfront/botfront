import { configure, addDecorator } from '@storybook/react';
import 'semantic-ui-css/semantic.min.css';
import '../client/main.less';
import {
    withReduxProvider,
    withProjectContext,
    withStoriesContext,
} from './decorators';

addDecorator(withReduxProvider);
addDecorator(withProjectContext);
addDecorator(withStoriesContext);

configure(require.context('../stories', true, /\.stories\.js$/), module);
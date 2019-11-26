import { configure, addDecorator } from '@storybook/react';
import 'semantic-ui-css/semantic.min.css';
import '../client/main.less';
import { withProvider } from './decorators';

function loadStories() {
    const req = require.context('../stories', true, /\.stories\.js$/);
    req.keys().forEach(filename => req(filename));
}

addDecorator(withProvider);

configure(loadStories, module);
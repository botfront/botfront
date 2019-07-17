import { configure } from '@storybook/react';
import 'semantic-ui-css/semantic.min.css';
import '../client/main.less';

function loadStories() {
    const req = require.context('../stories', true, /\.stories\.js$/);
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
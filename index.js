/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { Provider } from 'react-redux';
import { name as appName } from './app.json';
import store from "./src/store/index";

console.log(store);
const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);

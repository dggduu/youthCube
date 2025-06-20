import { AppRegistry } from 'react-native';
import App from './src/App';
import { Provider as ReduxProvider } from 'react-redux';
import {Provider as AntdProvider} from '@ant-design/react-native';
import { name as appName } from './app.json';
import store from "./src/store/index";


const Root = () => (
  <ReduxProvider store={store}>
    <AntdProvider>
      <App />
    </AntdProvider>
  </ReduxProvider>
);

AppRegistry.registerComponent(appName, () => Root);
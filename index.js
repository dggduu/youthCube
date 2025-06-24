import { AppRegistry } from 'react-native';
import App from './src/App';
import { Provider as ReduxProvider } from 'react-redux';
import {Provider as AntdProvider} from '@ant-design/react-native';
import { name as appName } from './app.json';
import store from "./src/store/index";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from "./src/components/tip/ToastHooks";

const Root = () => (
  <SafeAreaProvider>
    <ReduxProvider store={store}>
      <ToastProvider>
        <AntdProvider>
          <App />
        </AntdProvider>
      </ToastProvider>

    </ReduxProvider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
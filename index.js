import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import App from './src/App';
import {Provider as AntdProvider} from '@ant-design/react-native';
import { name as appName } from './app.json';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from "./src/components/tip/ToastHooks";
import { Host, Portal } from 'react-native-portalize';
const Root = () => (
  <SafeAreaProvider>
    <Host>
        <ToastProvider>
          <AntdProvider>
            <App />
          </AntdProvider>
      </ToastProvider>
    </Host>

  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
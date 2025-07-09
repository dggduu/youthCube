import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import App from './src/App';
import {Provider as AntdProvider} from '@ant-design/react-native';
import { name as appName } from './app.json';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from "./src/components/tip/ToastHooks";

const Root = () => (
  <SafeAreaProvider>
      <ToastProvider>
        <AntdProvider>
          <App />
        </AntdProvider>
      </ToastProvider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
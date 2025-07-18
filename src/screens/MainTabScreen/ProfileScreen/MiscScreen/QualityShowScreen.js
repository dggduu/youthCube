import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import BackIcon from "../../../../components/backIcon/backIcon";

// 用户协议内容（示例）
const userAgreement = `
  用户协议

  欢迎使用本应用！请在使用前仔细阅读以下条款。

  1. 使用条款
     通过使用本应用，您表示接受并同意遵守本协议的所有条款。

  2. 账户安全
     您有责任保护您的账户信息不被泄露。任何因账户被盗用而产生的后果由您自行承担。

  3. 内容版权
     本应用内的所有内容，包括但不限于文字、图片、视频等，均受版权保护，未经授权禁止转载或商业用途。

  4. 隐私政策
     我们尊重您的隐私权，我们不会在未取得您同意的情况下向第三方披露您的个人信息。

  5. 免责声明
     本应用提供的服务按“原样”提供，不承诺其无错误或无中断。我们将尽力保障服务稳定，但不对因服务中断造成的损失负责。

  6. 协议变更
     我们有权随时修改本协议内容，修改后的内容将在发布后生效。

  7. 法律适用
     本协议适用于中华人民共和国法律。
`;

const QualityShowScreen = () => {
  return (
    <SafeAreaView className='flex-1 bg-white dark:bg-gray-900'>
      <BackIcon isDark={false} />

      <ScrollView className='px-5 py-6 mb-7'>
        <Text className='text-2xl font-bold text-center mb-5 dark:text-gray-200'>用户协议</Text>
        <Text className='text-base leading-7 dark:text-gray-300'>{userAgreement}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QualityShowScreen;
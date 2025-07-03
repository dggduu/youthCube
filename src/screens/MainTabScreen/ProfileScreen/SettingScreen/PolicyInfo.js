import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import BackIcon from '../../../../components/backIcon/backIcon';

export default function PolicyInfo() {
  const { colorScheme } = useColorScheme();

  const textColor = colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const subTextColor = colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const headerTextColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
  const bulletPointColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700';

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <BackIcon /> 

      <ScrollView className="flex-1 px-5 pt-2 pb-10">
        {/* 页面主标题 */}
        <Text className={`text-3xl font-extrabold mb-4 text-center ${headerTextColor}`}>隐私政策</Text>
        {/* 日期信息 */}
        <Text className={`text-sm mb-8 text-center ${subTextColor}`}>生效日期：2025年7月3日</Text>

        {/* 政策引言 */}
        <Text className={`text-base leading-6 mb-4 ${textColor}`}>
          欢迎使用我们的应用程序！我们深知隐私对您的重要性，并致力于保护您的个人信息。本隐私政策旨在帮助您了解我们如何收集、使用、存储和分享您的信息。
        </Text>

        {/* --- 政策章节 --- */}

        {/* 章节1: 我们收集的信息 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>1. 我们收集的信息</Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">您直接提供的信息：</Text> 当您注册账户、填写个人资料、参与调查或联系我们时，您可能向我们提供姓名、电子邮件地址、电话号码、头像等信息。
        </Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">自动收集的信息：</Text> 当您使用我们的应用程序时，我们可能会自动收集设备信息（如设备型号、操作系统版本）、日志数据（如访问时间、应用崩溃报告）、IP 地址以及使用情况数据（如您访问的页面、使用的功能）。
        </Text>
        <Text className={`text-base leading-6 mb-4 ${bulletPointColor}`}>
          •  <Text className="font-semibold">第三方信息：</Text> 在您授权的情况下，我们可能从第三方服务（例如社交媒体平台）获取您的信息。
        </Text>

        {/* 章节2: 我们如何使用您的信息 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>2. 我们如何使用您的信息</Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">提供和维护服务：</Text> 包括创建和管理您的账户、提供您所需的功能、确保应用程序的正常运行。
        </Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">个性化用户体验：</Text> 根据您的偏好和使用习惯，为您提供更相关的内容和功能。
        </Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">改进我们的服务：</Text> 分析使用数据，了解用户需求，从而优化应用程序的性能、功能和用户界面。
        </Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">沟通：</Text> 向您发送服务通知、更新、营销信息（在您同意的情况下），以及回复您的查询和请求。
        </Text>
        <Text className={`text-base leading-6 mb-4 ${bulletPointColor}`}>
          •  <Text className="font-semibold">安全与合规：</Text> 检测和防止欺诈、滥用，遵守法律法规和内部政策。
        </Text>

        {/* 章节3: 信息共享与披露 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>3. 信息共享与披露</Text>
        <Text className={`text-base leading-6 mb-4 ${textColor}`}>
          未经您的明确同意，我们不会出售您的个人信息。我们可能在以下情况下分享您的信息：
        </Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">与服务提供商：</Text> 我们可能与协助我们提供服务的第三方合作，例如数据分析、客户支持、服务器托管等。这些服务提供商只能在为我们提供服务的必要范围内访问您的信息。
        </Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">法律要求：</Text> 当法律要求或为了响应有效的法律程序（如法院命令、政府请求）时，我们可能披露您的信息。
        </Text>
        <Text className={`text-base leading-6 mb-4 ${bulletPointColor}`}>
          •  <Text className="font-semibold">业务转移：</Text> 在合并、收购或资产出售的情况下，您的信息可能作为资产转移的一部分。
        </Text>

        {/* 章节4: 您的权利 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>4. 您的权利</Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">访问和更正：</Text> 您有权访问和更正您的个人信息。
        </Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">删除：</Text> 您有权要求删除您的个人信息，但某些信息可能因法律要求或服务需要而无法立即删除。
        </Text>
        <Text className={`text-base leading-6 mb-2 ${bulletPointColor}`}>
          •  <Text className="font-semibold">撤回同意：</Text> 如果我们基于您的同意处理信息，您有权随时撤回该同意。
        </Text>
        <Text className={`text-base leading-6 mb-4 ${bulletPointColor}`}>
          •  <Text className="font-semibold">数据可移植性：</Text> 您有权获取您提供给我们的个人信息副本。
        </Text>

        {/* 章节5: 数据安全 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>5. 数据安全</Text>
        <Text className={`text-base leading-6 mb-4 ${textColor}`}>
          我们采取合理的物理、技术和管理措施来保护您的个人信息，防止未经授权的访问、披露、使用或修改。然而，没有任何数据传输或存储系统是100%安全的，因此我们不能保证信息的绝对安全。
        </Text>

        {/* 章节6: 第三方链接 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>6. 第三方链接</Text>
        <Text className={`text-base leading-6 mb-4 ${textColor}`}>
          我们的应用程序可能包含指向第三方网站或服务的链接。本隐私政策不适用于这些第三方网站或服务，请您查阅其独立的隐私政策。
        </Text>

        {/* 章节7: 未成年人隐私 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>7. 未成年人隐私</Text>
        <Text className={`text-base leading-6 mb-4 ${textColor}`}>
          我们的服务不面向13岁以下的儿童（或您所在司法管辖区规定的其他年龄）。我们不会有意收集未成年人的个人信息。如果您认为我们可能收集了未成年人的信息，请联系我们。
        </Text>

        {/* 章节8: 隐私政策的变更 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>8. 隐私政策的变更</Text>
        <Text className={`text-base leading-6 mb-4 ${textColor}`}>
          我们可能会不时更新本隐私政策。任何变更将在本页面发布，并通过应用程序内通知或其他适当方式告知您。建议您定期查阅本政策以了解最新信息。
        </Text>

        {/* 章节9: 联系我们 */}
        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>9. 联系我们</Text>
        <Text className={`text-base leading-6 mb-2 ${textColor}`}>
          如果您对本隐私政策有任何疑问或疑虑，请通过以下方式联系我们：
        </Text>
        <Text className={`text-base leading-6 mb-1 ${bulletPointColor}`}>•  <Text className="font-semibold">电子邮件：</Text>consult@mail.aoicube.dpdns.org</Text>
        <Text className={`text-base leading-6 mb-4 ${bulletPointColor}`}>•  <Text className="font-semibold">地址：</Text>HUNNU 桃花坪校区 3 栋学生公寓</Text>
      </ScrollView>
    </View>
  );
}
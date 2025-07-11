import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import React from 'react'
import BackIcon from "../../components/backIcon/backIcon";

const SafeDeclare = () => {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <BackIcon/>
      <ScrollView className="px-6 py-6">
        <Text className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          户外活动安全声明
        </Text>

        <Text className="text-gray-700 dark:text-gray-300 mb-6">
          尊敬的用户：
          {"\n\n"}
          感谢您选择并使用我们的软件。为确保您的户外活动安全，保障您的合法权益，同时明确平台与用户之间的责任边界，特制定本《户外活动安全声明》。在您使用本平台进行户外活动规划、路线查询、装备推荐等服务前，请务必仔细阅读本声明。一旦您勾选"我已阅读并同意"，即视为您已充分知悉并接受本声明的全部内容。
        </Text>

        {/* 一、用户责任声明 */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3 text-gray-900 dark:text-white">一、用户责任声明</Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            1. 您作为完全民事行为能力人，在使用本平台进行户外活动规划时，应充分了解并自愿承担户外运动可能存在的各种风险。这些风险包括但不限于：摔倒、滑倒、扭伤、擦伤、中暑、失温、迷路、野生动物攻击、极端天气影响、装备故障、通讯中断等。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            2. 您应根据自身身体状况、技能水平和经验，合理评估活动难度，科学规划出行路线与时间，不得进行超出自身能力范围的户外活动。如您患有心脏病、高血压、哮喘等疾病，或存在其他健康隐患，应谨慎评估是否适合参与户外运动。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            3. 您应自行确保活动区域的安全性，避免进入未开发、未开放或存在明显危险隐患的区域。如遇禁止进入的警示标识，应严格遵守，不得擅自闯入。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            4. 您应妥善保管个人财物和个人信息，提高警惕，谨防以"户外活动"名义实施的诈骗行为。不要轻信非官方渠道发布的活动信息或人员邀请，不向陌生人透露个人敏感信息。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            5. 您应自行购买合适的户外活动保险，并确保在活动期间保险有效。对于因意外伤害导致的医疗费用、财产损失等，您应自行承担相关责任。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            6. 您应将详细的活动计划告知家人或可信赖的朋友，包括活动路线、预计出发和返回时间、同行人员信息等，以便在紧急情况下能够及时获得帮助。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300">
            7. 您应遵守法律法规、户外道德规范和当地管理规定，不得进行破坏环境、伤害他人或违法的行为。对于因违反规定导致的后果，您应自行承担全部责任。
          </Text>
        </View>

        {/* 二、安全使用指南 */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3 text-gray-900 dark:text-white">二、安全使用指南</Text>
          
          <Text className="font-semibold text-gray-800 dark:text-gray-200 mb-2">1. 行前准备</Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (1) 装备检查：出发前，请确保携带齐全且状态良好的装备，包括：
            {"\n"}• 通讯设备：手机、充电宝、卫星电话或对讲机（视活动类型而定）
            {"\n"}• 导航工具：地图、指南针、GPS设备等
            {"\n"}• 防护装备：头盔、登山杖、安全绳、救生衣等
            {"\n"}• 应急物资：急救包、药品、备用衣物、高热量食品、饮用水等
            {"\n"}• 防火工具：打火机、火柴等（仅在允许使用明火的区域携带）
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (2) 体能评估：根据活动路线难度、预计行程时间等，评估自身体能状况，必要时进行适应性训练。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (3) 天气查询：出行前密切关注目的地天气预报及气象预警信息，如遇极端天气（如暴雨、台风、高温、大雪等），请重新评估出行计划。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (4) 路线规划：合理规划行程，遵循"433原则"（上山用40%体力，下山用30%，最后30%留作应急储备），避免过度疲劳。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (5) 告知他人：将详细行程告知家人或可信赖的朋友，包括预计出发和返回时间、路线、同行人员等信息。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-4">
            (6) 保险购买：购买覆盖户外活动的意外伤害保险，确保在活动期间保险有效。
          </Text>

          <Text className="font-semibold text-gray-800 dark:text-gray-200 mb-2">2. 活动进行中</Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (1) 注意防火安全：
            {"\n"}• 在户外活动中请勿随意使用明火，严禁在林区、草地等易燃环境中吸烟或生火，防止引发火灾。
            {"\n"}• 如需生火，应选择开阔、无植被覆盖的区域，并确保火源完全熄灭后方可离开。
            {"\n"}• 携带防火工具，如灭火器或防火毯，以应对突发火灾情况。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (2) 安全用电提示：
            {"\n"}• 使用电子设备时请注意用电安全，避免在潮湿、雷雨天气中使用充电设备，谨防触电事故。
            {"\n"}• 选择防水性能良好的电子设备，必要时使用防水套。
            {"\n"}• 确保设备电量充足，避免因电量耗尽导致失联或迷路。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (3) 关注人身安全：
            {"\n"}• 严格按照规划的路线行走，不得擅自偏离路线或进入未知区域。
            {"\n"}• 遵循"4人以上结伴原则"，确保团队中有具备户外经验的领队。
            {"\n"}• 注意脚下安全，尤其是在湿滑、陡峭路段，保持适当步速，避免滑倒或跌落。
            {"\n"}• 穿戴合适的服装和鞋具，根据天气情况及时增减衣物，冬季注意防寒保暖。
            {"\n"}• 随身携带身份证明、紧急联系人信息及必要的药品。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-4">
            (4) 防范诈骗风险：
            {"\n"}• 警惕任何要求您提供银行卡号、密码、验证码等敏感信息的行为。
            {"\n"}• 不轻信非官方渠道发布的活动信息或人员邀请，所有活动信息均应通过本平台官方渠道获取。
            {"\n"}• 对于不明身份的人员，保持警惕，不随意接受其提供的食物、药品或帮助。
          </Text>

          <Text className="font-semibold text-gray-800 dark:text-gray-200 mb-2">3. 特殊场景注意事项</Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (1) 夜间活动：
            {"\n"}• 确保携带足够的照明设备（如头灯、手电筒）和备用电池。
            {"\n"}• 穿戴反光标识的服装，增加自身可见性。
            {"\n"}• 减少夜间行进速度，增加休息频率。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (2) 极端天气应对：
            {"\n"}• 雷雨天气：远离高处、空旷地带和孤立的大树，寻找低洼处避雨。
            {"\n"}• 暴雨天气：避免在河道、沟谷等低洼区域活动，以防山洪暴发。
            {"\n"}• 高温天气：避开正午炎热时段，适当增加休息频率，补充水分和电解质。
            {"\n"}• 大雪天气：注意防寒保暖，避免长时间暴露在寒冷环境中。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-4">
            (3) 中暑与失温预防：
            {"\n"}• 中暑预防：合理安排活动时间，避开正午炎热时段，携带足够的饮用水和电解质饮料。
            {"\n"}• 失温预防：注意穿着层次，及时更换潮湿衣物，携带足够的保暖装备。
          </Text>
        </View>

        {/* 三、风险告知与免责声明 */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3 text-gray-900 dark:text-white">三、风险告知与免责声明</Text>
          <Text className="font-semibold text-gray-800 dark:text-gray-200 mb-2">1. 平台服务性质说明</Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-4">
            本平台仅为用户提供户外活动相关信息、路线规划、装备推荐等技术参考服务，不提供实际户外活动的组织、指导或安全保障服务。您应自行对活动进行评估和准备，平台提供的信息仅供参考，不构成任何实际活动的建议或承诺。
          </Text>

          <Text className="font-semibold text-gray-800 dark:text-gray-200 mb-2">2. 免责声明</Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (1) 用户个人行为风险：
            {"\n"}• 因您未充分阅读本声明或未遵循安全提示导致的风险，平台不承担责任。
            {"\n"}• 因您隐瞒自身健康状况或未评估自身能力导致的风险，平台不承担责任。
            {"\n"}• 因您未按照规划路线行走或擅自改变行程导致的风险，平台不承担责任。
            {"\n"}• 因您未携带必要装备或未进行充分准备导致的风险，平台不承担责任。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            (2) 第三方因素风险：
            {"\n"}• 因其他用户提供的信息不准确或误导性内容导致的风险，平台不承担责任。
            {"\n"}• 因第三方服务（如天气预报、地图导航等）提供的信息不准确导致的风险，平台不承担责任。
            {"\n"}• 因第三方诈骗行为导致的风险，平台不承担责任。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-4">
            (3) 不可抗力风险：
            {"\n"}• 因自然灾害（如地震、山体滑坡、泥石流等）导致的风险，平台不承担责任。
            {"\n"}• 因极端天气（如暴雨、台风、大雪等）导致的风险，平台不承担责任。
            {"\n"}• 因突发公共事件（如疫情、交通管制等）导致的风险，平台不承担责任。
          </Text>
        </View>

        {/* 四、争议解决与法律适用 */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3 text-gray-900 dark:text-white">四、争议解决与法律适用</Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            1. 本声明的制定、解释和执行，均适用中华人民共和国大陆地区法律（不包括冲突法）。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            2. 如因使用本平台服务产生任何争议或纠纷，双方应友好协商解决；协商不成的，任何一方均有权向平台所在地有管辖权的人民法院提起诉讼。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            3. 平台已尽到合理的提示义务，通过显著方式（如加粗、弹窗等）提醒用户勾选即视为同意。用户勾选行为视为已充分知悉并接受本声明的全部内容。
          </Text>
          <Text className="text-gray-700 dark:text-gray-300">
            4. 本声明的修改和更新，平台将通过官方渠道提前通知用户。用户继续使用平台服务即视为接受修改后的声明。
          </Text>
        </View>

        {/* 五、联系方式 */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3 text-gray-900 dark:text-white">五、联系方式</Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            如您需要咨询或求助，请通过以下方式联系我们：
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            电子邮箱：service@mail.aoicube.dpdns.com
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            官方地址：湖南师范大学桃花坪校区3栋学生公寓
          </Text>
        </View>

        <Text className="text-gray-700 dark:text-gray-300 mb-6">
          请务必注意：本声明所述安全提示并非全部户外风险，实际户外活动中可能面临更多无法预见的风险。您作为户外活动的参与者，应充分了解并自愿承担这些风险。勾选"我已阅读并同意"即表示您已充分知悉并接受上述内容。
          {"\n\n"}
          再次提醒：安全第一，生命至上！请务必做好充分准备，合理规划行程，提高安全意识，确保户外活动安全顺利。
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SafeDeclare
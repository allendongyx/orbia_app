import React from "react";
import {
  Form,
  Col,
  Row,
  Button,
  Space,
  Steps,
  Typography,
} from "@douyinfe/semi-ui";
import { IconToast } from "@douyinfe/semi-icons-lab";
// import TimeRangeSelector from '@components/time_range_selector';
import { IconUpload } from "@douyinfe/semi-icons";
export default function Home() {
  const {
    Section,
    Input,
    InputNumber,
    AutoComplete,
    Select,
    TreeSelect,
    Cascader,
    DatePicker,
    TimePicker,
    TextArea,
    CheckboxGroup,
    Checkbox,
    RadioGroup,
    Radio,
    Slider,
    Rating,
    Switch,
    TagInput,
  } = Form;
  const { Text } = Typography;

  return (
    <>
      <Section text={"推广素材"} className="p-4">
        <Row>
          <Col span={24}>
            <Form.Upload
              field="files"
              label="证明文件（Upload）"
              action="//semi.design/api/upload"
            >
              <Button icon={<IconUpload />} theme="light">
                点击上传
              </Button>
            </Form.Upload>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Input
              field="name"
              label="广告文案"
              initValue={"mikeya"}
              trigger="blur"
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Select
              field="ro234le"
              label="行动引导文案"
            >
              <Select.Option value="operate">感兴趣</Select.Option>
              <Select.Option value="rd">立即注册</Select.Option>
              <Select.Option value="pm">去玩游戏</Select.Option>
              <Select.Option value="ued">了解详情</Select.Option>
            </Select>
          </Col>
        </Row>
      </Section>
      <Section text={"目标页面"} className="p-4 mt-0">
        <Row>
          <Col span={12}>
            <RadioGroup
              type="pureCard"
              defaultValue={2}
              aria-label="单选组合示例"
              name="demo-radio-group-pureCard"
            >
              <Radio
                value={2}
                extra="Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统"
                style={{ width: 280 }}
              >
                网站 URL
              </Radio>
              <Radio
                value={1}
                disabled
                extra="Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统"
                style={{ width: 280 }}
              >
                Orbia 定制页面
              </Radio>
            </RadioGroup>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <Input
              field="name"
              label="目标页面 URL"
              initValue={"mikeya"}
              trigger="blur"
            />
            <Text type="quaternary">
              输入 URL，即表示你授权 TikTok
              扫描、下载和修改此网页上的素材以生成建议。
            </Text>
          </Col>
        </Row>
      </Section>
    </>
  );
}

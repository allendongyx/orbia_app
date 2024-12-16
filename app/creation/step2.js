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
import { Tooltip, Tag } from "@douyinfe/semi-ui";
import DatePickerTable from "../components/time_selector";
import { IconHelpCircle } from "@douyinfe/semi-icons";
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

  const treeData = [
    {
      label: "浙江省",
      value: "zhejiang",
      children: [
        {
          label: "杭州市",
          value: "hangzhou",
          children: [
            {
              label: "西湖区",
              value: "xihu",
            },
            {
              label: "萧山区",
              value: "xiaoshan",
            },
            {
              label: "临安区",
              value: "linan",
            },
          ],
        },
        {
          label: "宁波市",
          value: "ningbo",
          children: [
            {
              label: "海曙区",
              value: "haishu",
            },
            {
              label: "江北区",
              value: "jiangbei",
            },
          ],
        },
      ],
    },
  ];
  return (
    <>
      <Section text={"受众定向"} className="p-4">
        <Row>
          <Col span={12}>
            <Cascader
              label="地域"
              defaultValue={["zhejiang", "ningbo", "jiangbei"]}
              style={{ width: 300 }}
              treeData={treeData}
              placeholder="请选择所在地区"
              multiple
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <CheckboxGroup
              field="type"
              direction="horizontal"
              label="年龄"
              initValue={["user", "admin"]}
              rules={[{ required: true }]}
            >
              <Checkbox value="admin">不限</Checkbox>
              <Checkbox value="user">18-24</Checkbox>
              <Checkbox value="guest">25-34</Checkbox>
              <Checkbox value="root">35-44</Checkbox>
              <Checkbox value="root">45-54</Checkbox>
              <Checkbox value="root">55+</Checkbox>
            </CheckboxGroup>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <RadioGroup
              field="isMonopolize"
              label="性别"
              rules={[
                { type: "boolean" },
                { required: true, message: "必须选择是否独占 " },
              ]}
            >
              <Radio value={1}>男</Radio>
              <Radio value={0}>女</Radio>
            </RadioGroup>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Select
              field="business"
              multiple
              className="w-4/5"
              // style={style}
              placeholder="语言"
              label={
                <Space>
                  <div>语言</div>
                  <Tooltip
                    content={
                      "选择定向语言（请选择所选地域内使用人数最多的语言）"
                    }
                  >
                    <IconHelpCircle />
                  </Tooltip>
                </Space>
              }
            >
              <Select.Option value="abc">阿拉伯语</Select.Option>
              <Select.Option value="ulikeCam">英语</Select.Option>
              <Select.Option value="toutiao">德语</Select.Option>
              <Select.Option value="toutiao">波兰语</Select.Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <RadioGroup
              field="isMonopolize"
              label="消费能力"
              rules={[
                { type: "boolean" },
                { required: true, message: "必须选择是否独占 " },
              ]}
            >
              <Radio value={0}>不限</Radio>
              <Radio value={1}>高消费能力</Radio>
            </RadioGroup>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <RadioGroup
              field="isMonopolize"
              label="操作系统"
              rules={[
                { type: "boolean" },
                { required: true, message: "必须选择是否独占 " },
              ]}
            >
              <Radio value={0}>不限</Radio>
              <Radio value={1}>Android</Radio>
              <Radio value={2}>iOS</Radio>
            </RadioGroup>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Select
              field="business"
              multiple
              className="w-4/5"
              // style={style}
              placeholder="系统版本"
              label="系统版本"
            >
              <Select.Option value="abc">Android 14.0 及以上</Select.Option>
              <Select.Option value="a2bc">iOS 17.3 及以上</Select.Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Select
              field="business"
              multiple
              className="w-4/5"
              // style={style}
              placeholder="设备机型"
              label="设备机型"
            >
              <Select.Option value="abc">Apple</Select.Option>
              <Select.Option value="a2bc">Google</Select.Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <RadioGroup
              field="isMonopolize"
              label="网络情况"
              rules={[
                { type: "boolean" },
                { required: true, message: "必须选择是否独占 " },
              ]}
            >
              <Radio value={0}>不限</Radio>
              <Radio value={1}>Wi-Fi</Radio>
              <Radio value={0}>2G</Radio>
              <Radio value={1}>3G</Radio>
              <Radio value={0}>4G</Radio>
              <Radio value={1}>5G</Radio>
            </RadioGroup>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Select
              field="business"
              multiple
              className="w-4/5"
              // style={style}
              placeholder="运营商"
              label="运营商"
            >
              <Select.Option value="abc">SG：Singtel</Select.Option>
              <Select.Option value="a2bc">SG：M1</Select.Option>
            </Select>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Select
              field="business"
              multiple
              className="w-4/5"
              // style={style}
              placeholder="互联网服务提供商"
              label="互联网服务提供商"
            >
              <Select.Option value="abc">SG：Singtel</Select.Option>
              <Select.Option value="a2bc">SG：M1</Select.Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <RadioGroup
              field="isMonopolize"
              label="设备价格"
              rules={[
                { type: "boolean" },
                { required: true, message: "必须选择是否独占 " },
              ]}
            >
              <Radio value={0}>不限</Radio>
              <Radio value={1}>特定区间</Radio>
            </RadioGroup>
          </Col>
        </Row>
      </Section>
      <Section text="预算和排期" className="pl-4 pr-4 m-0">
        <Row>
          <Col span={6}>
            <Form.InputGroup
              label={{ text: <span>预算</span>, required: true }}
              labelPosition="top"
            >
              <Form.Select field="xx" placeholder="请选择你的角色">
                <Form.Select.Option value="日预算">日预算</Form.Select.Option>
                <Form.Select.Option value="总预算">总预算</Form.Select.Option>
              </Form.Select>
              <Form.Input
                suffix={
                  <Typography.Text
                    strong
                    type="secondary"
                    style={{ marginRight: 8 }}
                  >
                    USD
                  </Typography.Text>
                }
                showClear
              ></Form.Input>
            </Form.InputGroup>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.DatePicker
              field="date"
              type="dateTime"
              label="投放开始时间"
              style={{ width: "250px" }}
              initValue={new Date()}
            ></Form.DatePicker>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <RadioGroup
              field="answerTime"
              label="分时段投放"
              direction="vertical"
              initValue={"always"}
              rules={[{ required: true }]}
            >
              <Radio value="always">全天</Radio>
              <Radio value="user">
                <div style={{ display: "inline-block" }}>特定时段</div>
              </Radio>
            </RadioGroup>
          </Col>
        </Row>
        <DatePickerTable />
      </Section>
      <Section text="出价和优化" className="pl-4 pr-4">
        <Row>
          <Col span={6}>
            <Form.Select
              field="busin22222ess"
              className="w-4/5"
              // style={style}
              placeholder="优化目标"
              label="优化目标"
            >
              <Form.Select.Option value="abc">点击</Form.Select.Option>
              <Form.Select.Option value="a2bc">落地页浏览量</Form.Select.Option>
            </Form.Select>
          </Col>
        </Row>
        <Row align="middle">
          <Col span={6}>
            <Input label="平均点击成本上限（可选）" />
          </Col>
          <Col>SGD/点击</Col>
        </Row>
      </Section>
    </>
  );
}

"use client";
import React from "react";
import {
  Form,
  Col,
  Row,
  Button,
  Space,
  Steps,
  Tooltip,
} from "@douyinfe/semi-ui";
import { IconToast } from "@douyinfe/semi-icons-lab";
import { Card, Typography } from "@douyinfe/semi-ui";
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
  const { Text } = Typography;

  return (
    <Section text={"基本信息"} className="p-4">
      <Row>
        <Col span={12}>
          <Input
            field="name"
            label="广告名称"
            // initValue={"mikeya"}
            placeholder="请输入广告名称"
            // style={style}
            // trigger="blur"
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <RadioGroup
            type="card"
            defaultValue={2}
            // direction="vertical"
            label="推广目标"
            aria-label="单选组合示例"
            name="demo-radio-group-card"
            direction="horizontal"
          >
            <Radio
              value={2}
              extra={
                <div>
                  <Text> ✓ 吸引更多受众访问你网站上的目标页面。</Text>
                  <br />
                  <Text> ✓ 吸引受众在你的网站上执行更多有价值的操作。</Text>
                </div>
              }
              style={{ width: 280 }}
            >
              <Row align="middle" className="w-full">
                <Col span={18}>推广你的网页</Col>
                <Col span={6} className="text-right ">
                  <Tooltip
                    content={"吸引用户在您的网站上执行更多有价值的操作。"}
                  >
                    <IconHelpCircle />
                  </Tooltip>
                </Col>
              </Row>
            </Radio>
            <Radio
              value={3}
              extra={
                <div>
                  <Text> ✓ 吸引更多受众访问你网站上的目标页面。</Text>
                  <br />
                  <Text> ✓ 吸引受众在你的网站上执行更多有价值的操作。</Text>
                </div>
              }
              style={{ width: 280 }}
            >
              <Row align="middle" className="w-full">
                <Col span={18}>推广你的应用</Col>
                <Col span={6} className="text-right ">
                  <Tooltip
                    content={
                      "以经济高效的方式吸引更多用户安装你的应用并在应用中执行你期望的操作。"
                    }
                  >
                    <IconHelpCircle />
                  </Tooltip>
                </Col>
              </Row>
            </Radio>
          </RadioGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <RadioGroup
            field="type"
            label="主要作用"
            direction="vertical"
            initValue={"always"}
          >
            <Radio value="always">访问量</Radio>
            <Radio value="user">网站转化量</Radio>
            <Radio value="dd">表单收集</Radio>
          </RadioGroup>
        </Col>
      </Row>
    </Section>
  );
}

"use client";
import React, { useState } from "react";
import {
  Form,
  Col,
  Row,
  Button,
  Space,
  Steps,
  Progress,
  Tag,
  Anchor,
} from "@douyinfe/semi-ui";
import { IconUpload } from "@douyinfe/semi-icons";
import { IconToast } from "@douyinfe/semi-icons-lab";

import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
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

  const [currentStep, setCurrentStep] = useState(2);

  return (
    <div className="h-full w-full">
      <Row className="h-full">
        <Col span={4}>
          <div className="p-4">
            <div>可用受众</div>
            <div>
              <Progress
                percent={25}
                stroke="var(--semi-color-danger)"
                aria-label="disk usage"
              />
            </div>
            <div className="mt-4">
              <Space>
                <Tag size="large" color="cyan">
                  较为广泛
                </Tag>
                <span className="text-xs">9,136,000-11,167,000 </span>
              </Space>
            </div>
            <div className="bg-gray-500 text-xs text-white p-2 mt-2">
              根据数据安全要求，预估的可用受众不包含未满 18
              岁的用户。符合相关法律要求的广告投放活动不会受此影响。
            </div>

            <div className="mt-4">
              <div>定向设置</div>
            </div>
          </div>
        </Col>
        <Col span={20} className="border">
          <Form init className="h-full" onValueChange={(v) => console.log(v)}>
            {currentStep === 0 && <Step1 />}
            {currentStep === 1 && <Step2 />}
            {currentStep === 2 && <Step3 />}

            <div className="sticky grid border-t bottom-0 p-4 mt-14 bg-white">
              <Row type="flex" align="middle">
                <Col span={7}>
                  <div className="h-full pl-10 flex items-center">
                    <Button
                      type="tertiary"
                      theme="solid"
                      htmlType="submit"
                      className="btn-margin-right "
                    >
                      后退
                    </Button>
                  </div>
                </Col>
                <Col span={10}>
                  <div className="pl-4 pr-4">
                    <Steps
                      // direction="vertical"
                      type="basic"
                      current={currentStep}
                      onChange={(i) => setCurrentStep(i)}
                    >
                      <Steps.Step
                        title="第一步"
                        description="This is a description"
                      />
                      <Steps.Step
                        title="第二步"
                        description="This is a description"
                      />
                      <Steps.Step
                        title="完成"
                        description="This is a description"
                      />
                    </Steps>
                  </div>
                </Col>
                <Col span={7}>
                  <div className="h-full pr-10 flex justify-end content-center">
                    <Button
                      type="primary"
                      theme="solid"
                      htmlType="submit"
                      className="btn-margin-right "
                    >
                      下一步
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

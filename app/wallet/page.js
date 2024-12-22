"use client";
import React, { useState } from "react";
import {
  Form,
  Col,
  Row,
  Button,
  Space,
  Steps,
  Section,
  Card,
  Table,
  Descriptions,
  Tooltip,
} from "@douyinfe/semi-ui";
import { IconUpload, IconArrowUp, IconHelpCircle } from "@douyinfe/semi-icons";
import { IconToast } from "@douyinfe/semi-icons-lab";
import { Anchor } from "@douyinfe/semi-ui";
import { Progress } from "@douyinfe/semi-ui";
import { Tag } from "@douyinfe/semi-ui";
import { Tabs, TabPane } from "@douyinfe/semi-ui";
import xiaofeiData from "./xiaofei.json";
import chongzhiData from "./chongzhi.json";

export default function Profile() {
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
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "消费名称",
      dataIndex: "name",
    },
    {
      title: "消费类型",
      dataIndex: "type",
    },
    {
      title: "消费日期",
      dataIndex: "updateTime",
    },
  ];
  const columns2 = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "时间",
      dataIndex: "date",
    },
    {
      title: "金额",
      dataIndex: "amount",
    },
    {
      title: "支付方式",
      dataIndex: "payType",
    },
  ];

  const Descriptiondata = [
    { key: "当前余额", value: "1,480,000$" },
    {
      key: "今日消费",
      value: <span>24,123$</span>,
    },
  ];
  return (
    <>
      <Card>
        <Form
          // initValues={initValues}
          // style={{ padding: 10, width: "100%" }}
          onValueChange={(v) => console.log(v)}
        >
          <Section text={"财务信息"}>
            <Row>
              <Col span={12}>
                <Descriptions
                  className="mt-4"
                  data={Descriptiondata}
                  row
                  size="large"
                />
              </Col>
              <Col>
                <Button className="w-20 mr-4" theme="solid" type="primary">
                  充值
                </Button>
                <Tooltip
                  className="w-24"
                  position="top"
                  content="申请退款前，可以查看退款指南"
                >
                  <Button
                    theme="solid"
                    icon={<IconHelpCircle />}
                    type="tertiary"
                  >
                    申请退款
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </Section>
        </Form>
      </Card>
      <Card className="mt-4">
        <Tabs type="line">
          <TabPane tab="消费记录" itemKey="1">
            <Table key="id" columns={columns} dataSource={xiaofeiData} />
          </TabPane>
          <TabPane tab="充值记录" itemKey="2">
            <Table key="id" columns={columns2} dataSource={chongzhiData} />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
}

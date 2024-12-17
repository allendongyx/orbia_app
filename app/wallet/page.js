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
} from "@douyinfe/semi-ui";
import { IconUpload } from "@douyinfe/semi-icons";
import { IconToast } from "@douyinfe/semi-icons-lab";
import { Anchor } from "@douyinfe/semi-ui";
import { Progress } from "@douyinfe/semi-ui";
import { Tag } from "@douyinfe/semi-ui";
import { Tabs, TabPane } from "@douyinfe/semi-ui";

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
      dataIndex: "name",
    },
    {
      title: "消费名称",
      dataIndex: "size",
    },
    {
      title: "消费类型",
      dataIndex: "owner",
    },
    {
      title: "消费日期",
      dataIndex: "updateTime",
    },
    {
      title: "消费流水",
      dataIndex: "updateTime",
    },
  ];
  const data = [
    {
      key: "1",
      name: "Semi Design 设计稿.fig",
      nameIconSrc:
        "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/figma-icon.png",
      size: "2M",
      owner: "姜鹏志",
      status: "success",
      updateTime: "2020-02-02 05:13",
      avatarBg: "grey",
    },
    {
      key: "2",
      name: "Semi Design 分享演示文稿",
      nameIconSrc:
        "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png",
      size: "2M",
      owner: "郝宣",
      status: "pending",
      updateTime: "2020-01-17 05:31",
      avatarBg: "red",
    },
    {
      key: "3",
      name: "设计文档",
      nameIconSrc:
        "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png",
      size: "34KB",
      status: "wait",
      owner: "Zoey Edwards",
      updateTime: "2020-01-26 11:01",
      avatarBg: "light-blue",
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
          <Section text={"基本信息"}>
            <Row>
              <Col span={12}>
                <Input
                  field="name"
                  label="名称（Input）"
                  initValue={"mikeya"}
                  // style={style}
                  trigger="blur"
                />
              </Col>
            </Row>
          </Section>
        </Form>
      </Card>
      <Card className="mt-4">
        <Tabs type="line">
          <TabPane tab="消费记录" itemKey="1">
            <Table columns={columns} dataSource={data} />
          </TabPane>
          <TabPane tab="充值记录" itemKey="2">
            <h3>快速起步</h3>
            <pre
              style={{
                margin: "24px 0",
                padding: "20px",
                border: "none",
                whiteSpace: "normal",
                borderRadius: "var(--semi-border-radius-medium)",
                color: "var(--semi-color-text-1)",
                backgroundColor: "var(--semi-color-fill-0)",
              }}
            >
              <code>yarn add @douyinfe/semi-ui</code>
            </pre>
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
}

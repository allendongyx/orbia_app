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
} from "@douyinfe/semi-ui";
import { IconUpload } from "@douyinfe/semi-icons";
import { IconToast } from "@douyinfe/semi-icons-lab";
import { Anchor } from "@douyinfe/semi-ui";
import { Progress } from "@douyinfe/semi-ui";
import { Tag } from "@douyinfe/semi-ui";
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

  return (
    <>
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
    </>
  );
}

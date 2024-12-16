"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Form,
  Col,
  Card,
  Typography,
  Row,
  Button,
  Space,
  Steps,
} from "@douyinfe/semi-ui";
import {
  IconUpload,
  IconTickCircle,
  IconClear,
  IconMore,
  IconComment,
} from "@douyinfe/semi-icons";
import { IconToast } from "@douyinfe/semi-icons-lab";
import { Anchor } from "@douyinfe/semi-ui";
import { Progress } from "@douyinfe/semi-ui";
import { Tag } from "@douyinfe/semi-ui";
import { Table, Avatar } from "@douyinfe/semi-ui";
const { Text } = Typography;

export default function Ads() {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },
    {
      title: "名称",
      dataIndex: "name",
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },
    {
      title: "状态",
      dataIndex: "status",

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
      render: (text) => {
        const tagConfig = {
          success: {
            color: "green",
            prefixIcon: <IconTickCircle />,
            text: "投放中",
          },
          pending: { color: "pink", prefixIcon: <IconClear />, text: "待投放" },
          wait: { color: "cyan", prefixIcon: <IconComment />, text: "已暂停" },
        };
        const tagProps = tagConfig[text];
        return (
          <Tag shape="circle" {...tagProps} style={{ userSelect: "text" }}>
            {tagProps.text}
          </Tag>
        );
      },
    },
    {
      title: "预算",
      dataIndex: "budget",

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },
    {
      title: "消耗",
      dataIndex: "cost",

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },

    {
      title: "CPC(destination)",
      dataIndex: "cpc",

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },

    {
      title: "CPM",
      dataIndex: "cpm",

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },

    {
      title: "展示次数",
      dataIndex: "impressions",

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },
    {
      title: "点击次数",
      dataIndex: "clicks",

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },
  ];
  const data = [
    {
      id: "1",
      name: "Orbia 广告案例 1",
      status: "success",
      budget: "400 $",
      cost: "200 $",
      cpc: "1 $",
      cpm: "0.53 $",
      impressions: "4,132",
      clicks: "34,875",
    },

    {
      id: "2",
      name: "Orbia 广告案例 2",
      status: "success",
      budget: "400 $",
      cost: "200 $",
      cpc: "1 $",
      cpm: "0.53 $",
      impressions: "4,132",
      clicks: "34,875",
    },

    {
      id: "3",
      name: "Orbia 广告案例 3",
      status: "success",
      budget: "400 $",
      cost: "200 $",
      cpc: "1 $",
      cpm: "0.53 $",
      impressions: "4,132",
      clicks: "34,875",
    },
  ];

  const [dataSource, setData] = useState([]);

  const rowSelection = useMemo(
    () => ({
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(
          `selectedRowKeys: ${selectedRowKeys}`,
          "selectedRows: ",
          selectedRows
        );
      },
      getCheckboxProps: (record) => ({
        id: record.id,
      }),
    }),
    []
  );

  useEffect(() => {
    setData(data);
  }, []);

  return (
    <>
      <div>
        <Card
        // title="Semi Design"
        // style={{ maxWidth: 360 }}
        // headerExtraContent={<Text link>更多</Text>}
        >
          <Form
            labelPosition="left"
            render={({ formState, formApi, values }) => (
              <>
                <Form.Input
                  field="UserName"
                  label="广告名称"
                  className=" w-48"
                />
                <Form.Select field="Role" label="状态" className=" w-48">
                  <Form.Select.Option value="admin">全部</Form.Select.Option>
                  <Form.Select.Option value="user">投放中</Form.Select.Option>
                  <Form.Select.Option value="guest">待投放</Form.Select.Option>
                  <Form.Select.Option value="guest2">未投放</Form.Select.Option>
                  <Form.Select.Option value="guest3">已暂停</Form.Select.Option>
                  <Form.Select.Option value="guest4">已删除</Form.Select.Option>
                </Form.Select>
              </>
            )}
            layout="horizontal"
            onValueChange={(values) => console.log(values)}
          ></Form>
        </Card>
      </div>
      <Card className="mt-8">
        <div className="mb-4">
          <Button
            style={{ marginRight: 8 }}
            theme="solid"
            onClick={()=>{
              
            }}
            type="primary"
            icon={<IconUpload />}
          >
            新建广告
          </Button>
          <Button theme="light" type="tertiary">
            批量删除
          </Button>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
        />
      </Card>
    </>
  );
}

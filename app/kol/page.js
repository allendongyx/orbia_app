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
  Progress,
  Steps,
  Tag,
  Table,
  Avatar,
} from "@douyinfe/semi-ui";
import Link from "next/link";
import data from "./data.json";
import {
  IconUpload,
  IconTickCircle,
  IconClear,
  IconPlay,
  IconMore,
  IconComment,
} from "@douyinfe/semi-icons";
import { IconToast } from "@douyinfe/semi-icons-lab";
import { Anchor } from "@douyinfe/semi-ui";
import { render } from "react-dom";
const { Text } = Typography;

export default function Kols() {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 50,
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
      fixed: true,
    },
    {
      title: "KOL",
      dataIndex: "name",
      width: 260,
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
      fixed: true,

      render: (text, record) => {
        return (
          <Row>
            <Col span={6}>
              <Avatar
                src={`https://randomuser.me/api/portraits/men/${record.id}.jpg`}
              />
            </Col>

            <Col span={18} className="pl-4">
              <div className=" font-bold">{text}</div>
              <div className="">英语</div>
            </Col>
          </Row>
        );
      },
    },
    {
      title: "代表作品",
      dataIndex: "masterpiece_works",
      // className: "w-96",
      width: 240,
      render: (text) => {
        return (
          <Row className="">
            {text.map((item, index) => {
              return (
                <Col span={12} key={item.id}>
                  <div className="relative w-24 h-24 bg-black flex justify-center items-center rounded-xl">
                    <IconPlay className="absolute text-white top-50% left-50% transform -translate-x-50% -translate-y-50%" />
                    <img
                      className="rounded-xl max-w-full max-h-full"
                      src={item.cover}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        );
      },
    },
    {
      title: "内容类型",
      dataIndex: "tags",
      width: 140,
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
      render: (text) => {
        return (
          <div>
            <Space wrap>
              {text.map((item, index) => {
                return <Tag key={item.id}>{item.name}</Tag>;
              })}
            </Space>
          </div>
        );
      },
    },
    {
      title: "传播指数",
      dataIndex: "spread_index",
      width: 140,

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },

    {
      title: "全网粉丝",
      dataIndex: "follower_all",
      width: 120,

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },

    {
      title: "预期CMP",
      dataIndex: "prospective_cmp",
      width: 120,

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },

    {
      title: "预期播放量",
      dataIndex: "prospective_vv",
      width: 130,

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },
    {
      title: "21-60s 报价",
      dataIndex: "offer_price",
      width: 140,
      fixed: "right",
      render: (text) => {
        return (
          <Text className='text-2xl' strong type="danger">
            {text}
          </Text>
        );
      },

      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => (a.name.length - b.name.length > 0 ? 1 : -1),
    },

    {
      title: "操作",
      dataIndex: "operate",
      fixed: "right",
      width: 140,
      render: (text) => {
        return (
          <div>
            <Button theme="solid" className="pl-10 pr-10" type="primary">
              下单
            </Button>
          </div>
        );
      },
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
      fixed: true,
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
                  label="达人昵称"
                  className=" w-48"
                />
                <Form.Select field="Role" label="Status" className=" w-48">
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
          <Link href="/ads/creation">
            <Button
              style={{ marginRight: 8 }}
              theme="solid"
              onClick={() => {}}
              type="primary"
              icon={<IconUpload />}
            >
              New
            </Button>
          </Link>
          <Button theme="light" type="tertiary">
            Delete
          </Button>
        </div>
        <Table
          rowKey="id"
          scroll={{
            x: 1000,
          }}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
        />
      </Card>
    </>
  );
}

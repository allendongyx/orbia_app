"use client";
import React, { useState } from "react";
import {
  Form,
  Col,
  Row,
  Button,
  Space,
  Steps,
  Card,
  Divider,
} from "@douyinfe/semi-ui";
import { IconUpload } from "@douyinfe/semi-icons";
import {
  IconToast,
  IconRating,
  IconSelect,
  IconMarkdown,
  IconChart,
  IconToken,
} from "@douyinfe/semi-icons-lab";
import { Anchor } from "@douyinfe/semi-ui";
import { Progress } from "@douyinfe/semi-ui";
import { Tag } from "@douyinfe/semi-ui";
export default function Dashboard() {
  return (
    <>
      <Row gutter={8}>
        <Col span={16}>
          <Card title="Get Started">
            <Row gutter={8}>
              <Col span={8}>
                <Card className="border-0 bg-gray-100">
                  <Row>
                    <Col span={6}>
                      <IconToast
                        style={{ "font-size": "40px" }}
                        size="extra-large"
                        className=" text-3xl"
                      />
                    </Col>
                    <Col span={18}>
                      <div className="font-bold text-base text-black">
                        创建你的广告
                      </div>
                      <div className="mt-2 mb-2">
                        Once your billing and payment details are set up, you're
                        ready to run campaigns.
                      </div>
                      <Button theme="solid" type="primary">
                        创建广告
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={8}>
                <Card className="border-0 bg-gray-100">
                  <Row>
                    <Col span={6}>
                      <IconMarkdown
                        style={{ "font-size": "40px" }}
                        size="extra-large"
                        className=" text-3xl"
                      />
                    </Col>
                    <Col span={18}>
                      <div className="font-bold text-base text-black">
                        充值并调整预算
                      </div>
                      <div className="mt-2 mb-2">
                        Once your billing and payment details are set up, you're
                        ready to run campaigns.
                      </div>
                      <Button theme="solid" type="primary">
                        创建广告
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={8}>
                <Card className="border-0 bg-gray-100">
                  <Row>
                    <Col span={6}>
                      <IconChart
                        style={{ "font-size": "40px" }}
                        size="extra-large"
                        className=" text-3xl"
                      />
                    </Col>
                    <Col span={18}>
                      <div className="font-bold text-base text-black">
                        发布广告监控效果
                      </div>
                      <div className="mt-2 mb-2">
                        Once your billing and payment details are set up, you're
                        ready to run campaigns.
                      </div>
                      <Button theme="solid" type="primary">
                        创建广告
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>
          <Card className="mt-4" title="Creative & Inspiration">
            <Row>
              <Col span={12}>
                <Card className="border-0">
                  <div>好评广告</div>
                  <Row>
                    <Col>
                      <img src="/ad_1.png" />
                    </Col>
                    <Col>
                      <img src="/ad_2.png" />
                    </Col>
                    <Col>
                      <img src="/ad_3.png" />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card className="border-0">
                  <div>内容趋势</div>
                  <div>由 Orbia 数据分析统计</div>
                  <div>
                    <Row>
                      <Col>排名</Col>
                      <Col>热点词</Col>
                      <Col>价值</Col>
                      <Col>热度</Col>
                    </Row>
                    <Row>
                      <Col>1</Col>
                      <Col>Defi</Col>
                      <Col>中</Col>
                      <Col>3,434,932</Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Learning">
            <Card className="bg-gray-100 border-0 text-white">
              <Row>
                <Col span={18}>
                  <div className="font-bold text-black text-xl">
                    KOLs works with TikTok
                  </div>
                  <div className="mt-2 mb-2">
                    You don't need to change anything in your Google Analytics
                    setup. Learn more
                  </div>
                  <Button type="">More {">"}</Button>
                </Col>
                <Col span={6}>
                  <IconToast
                    style={{ "font-size": "100px" }}
                    size="extra-large"
                    className=" text-3xl"
                  />
                </Col>
              </Row>
            </Card>
            <Card className="bg-gray-100 border-0 text-white mt-4">
              <Row>
                <Col span={18}>
                  <div className="font-bold text-black text-xl">
                    Ads works with TikTok
                  </div>
                  <div className="mt-2 mb-2">
                    You don't need to change anything in your Google Analytics
                    setup. Learn more
                  </div>
                  <Button type="">More {">"}</Button>
                </Col>
                <Col span={6}>
                  <IconSelect
                    style={{ "font-size": "100px" }}
                    size="extra-large"
                    className=" text-3xl"
                  />
                </Col>
              </Row>
            </Card>
          </Card>
          <Card className="mt-4" title="Find your customers"></Card>
        </Col>
      </Row>
    </>
  );
}

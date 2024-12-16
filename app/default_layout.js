"use client";
import React from "react";
import {
  Nav,
  Avatar,
  Dropdown,
  Select,
  Button,
  Layout,
  Breadcrumb,
  Skeleton,
} from "@douyinfe/semi-ui";
import {
  IconStar,
  IconLanguage,
  IconSemiLogo,
  IconBytedanceLogo,
  IconBell,
  IconHelpCircle,
} from "@douyinfe/semi-icons";
import Link from "next/link";

import {
  IconTreeSelect,
  IconForm,
  IconBreadcrumb,
  IconBanner,
  IconBadge,
  IconNotification,
  IconSteps,
  IconTree,
  IconTabs,
  IconNavigation,
} from "@douyinfe/semi-icons-lab";

const DefaultLayout = ({ children }) => {
  const { Header, Footer, Sider, Content } = Layout;

  const TopHeader = () => (
    <Header
      style={{ backgroundColor: "var(--semi-color-bg-1)" }}
      className="semi-always-dark"
    >
      <div>
        <Nav
          mode={"horizontal"}
          // items={[
          //   { itemKey: "user", text: "Dashboard", icon: <IconBadge /> },
          //   { itemKey: "user", text: "设置", icon: <IconBadge /> },
          // ]}
          onSelect={(key) => console.log(key)}
          header={{
            logo: <IconSemiLogo style={{ height: "36px", fontSize: 36 }} />,
            text: "Orbia 广告平台",
          }}
          footer={
            <Dropdown
              position="bottomRight"
              render={
                <Dropdown.Menu>
                  <Dropdown.Item>详情</Dropdown.Item>
                  <Dropdown.Item>退出</Dropdown.Item>
                </Dropdown.Menu>
              }
            >
              <Avatar size="small" color="light-blue" style={{ margin: 4 }}>
                BD
              </Avatar>
              <span>Bytedancer</span>
            </Dropdown>
          }
        />
      </div>
    </Header>
  );

  const LeftNav = () => (
    <Nav
      className="semi-always-dark h-full"
      defaultSelectedKeys={["Home"]}
      renderWrapper={({ itemElement, isSubNav, isInSubNav, props }) => {
        const routerMap = {
          Home: "/",
          ADS: "/ads",
          KOL: "/kol",
          Dashboard: "/dashboard",
          "Nothing Here": "/nothing-here",
        };
        return (
          <Link
            style={{ textDecoration: "none" }}
            href={routerMap[props.itemKey] || "/"}
          >
            {itemElement}
          </Link>
        );
      }}
      items={[
        {
          text: "概览",
          icon: <IconSteps />,
          itemKey: "Dashboard",
        },
        {
          itemKey: "ADS",
          text: "广告列表",
          // className: "p-10",
          icon: <IconBreadcrumb />,
        },
        { itemKey: "KOL", text: "KOL 推广", icon: <IconTreeSelect /> },
        { itemKey: "Setting", text: "设置", icon: <IconBadge /> },
      ]}
      footer={{
        collapseButton: true,
      }}
    />
  );

  const FooterContent = () => (
    <>
      <span
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconBytedanceLogo size="large" style={{ marginRight: "8px" }} />
        <span>
          Copyright © {new Date().getFullYear()} ByteDance. All Rights Reserved.{" "}
        </span>
      </span>
      <span>
        <span style={{ marginRight: "24px" }}>平台客服</span>
        <span>反馈建议</span>
      </span>
    </>
  );
  return (
    <Layout style={{ border: "1px solid var(--semi-color-border)" }}>
      <TopHeader />
      <Layout>
        <Sider
          className="h-[calc(100vh-60px)]"
          style={{ backgroundColor: "var(--semi-color-bg-1)" }}
        >
          <LeftNav />
        </Sider>
        <Content
          className="overflow-auto h-[calc(100vh-60px)] pl-10 pr-10 pt-6 pb-6"
          style={{
            backgroundColor: "var(--semi-color-default)",
          }}
        >
          {children}
        </Content>
      </Layout>
      {/* <Footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
          color: "var(--semi-color-text-2)",
          backgroundColor: "rgba(var(--semi-grey-0), 1)",
        }}
      >
        <FooterContent />
      </Footer> */}
    </Layout>
  );
};

export default DefaultLayout;

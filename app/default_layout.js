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
  Divider,
} from "@douyinfe/semi-ui";
import {
  IconStar,
  IconLanguage,
  IconSemiLogo,
  IconBytedanceLogo,
  IconBell,
  IconBox,
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
            text: "Orbia",
          }}
          footer={
            <div className="flex justify-center items-center">
              <Link
                target="_blank"
                href="https://orbia.gitbook.io/orbia-docs"
                className="flex justify-center items-center"
              >
                <IconHelpCircle className="text-white  cursor-pointer" />
              </Link>
              <Divider layout="vertical" margin="12px" />

              <IconBell className="cursor-pointer text-white mr-4" />
              <Dropdown
                position="bottom"
                render={
                  <Dropdown.Menu>
                    <Dropdown.Title>ID: 17849217429</Dropdown.Title>
                    <Dropdown.Item icon={<IconBox />}>
                      Logout
                    </Dropdown.Item>{" "}
                  </Dropdown.Menu>
                }
              >
                <Button theme="outline" type="tertiary">
                  User: allendongxy@gmail.com
                </Button>
              </Dropdown>
            </div>
          }
        />
      </div>
    </Header>
  );

  const LeftNav = () => (
    <Nav
      className="semi-always-dark h-full"
      defaultSelectedKeys={["Dashboard"]}
      renderWrapper={({ itemElement, isSubNav, isInSubNav, props }) => {
        const routerMap = {
          ADS: "/ads",
          KOL: "/kol",
          Dashboard: "/dashboard",
          Wallet: "/wallet",
          Settings: "/settings",
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
          text: "Dashboard",
          icon: <IconSteps />,
          itemKey: "Dashboard",
        },
        {
          itemKey: "ADS",
          text: "Campaign",
          // className: "p-10",
          icon: <IconBreadcrumb />,
        },
        { itemKey: "KOL", text: "KOLs", icon: <IconTreeSelect /> },
        { itemKey: "Wallet", text: "Wallet", icon: <IconTreeSelect /> },
        { itemKey: "Settings", text: "Settings", icon: <IconBadge /> },
      ]}
      footer={{
        collapseButton: true,
      }}
    />
  );

  return (
    <Layout>
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
    </Layout>
  );
};

export default DefaultLayout;

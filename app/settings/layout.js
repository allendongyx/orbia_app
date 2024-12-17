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
  Row,
  Col,
  Card,
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

  const LeftNav = () => (
    <Nav
      className=" h-full"
      defaultSelectedKeys={["SettingsProfile"]}
      renderWrapper={({ itemElement, isSubNav, isInSubNav, props }) => {
        const routerMap = {
          SettingsProfile: "/settings/profile",
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
          text: "Profile",
          icon: <IconSteps />,
          itemKey: "SettingsProfile",
        },
      ]}
    />
  );

  return (
    <Layout>
      <Sider>
        <LeftNav />
      </Sider>
      <Card className="ml-4 w-full">{children}</Card>
    </Layout>
  );
};

export default DefaultLayout;

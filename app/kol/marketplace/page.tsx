"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Eye,
  Play,
  Star,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIconContainer, cardStyles } from "@/lib/design-system";
import data from "../data.json";

interface KOL {
  id: string;
  name: string;
  masterpiece_works: Array<{ id: string; cover: string }>;
  tags: Array<{ id: string; name: string }>;
  spread_index: string;
  follower_all: string;
  prospective_cmp: string;
  prospective_vv: string;
  offer_price: string;
}

export default function Kols() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dataSource] = useState<KOL[]>(data as KOL[]);

  // 统计数据
  const stats = [
    {
      title: "Total KOLs",
      value: dataSource.length.toString(),
      icon: Users,
      gradient: "purple",
    },
    {
      title: "Avg. Followers",
      value: "3.8M",
      icon: TrendingUp,
      gradient: "blue",
    },
    {
      title: "Total Reach",
      value: "38M+",
      icon: Eye,
      gradient: "green",
    },
    {
      title: "Top Rated",
      value: "94%",
      icon: Star,
      gradient: "orange",
    },
  ];

  // 过滤 KOL
  const filteredKOLs = dataSource.filter((kol) => {
    const matchesSearch = kol.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || kol.tags.some(tag => tag.name.toLowerCase() === categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={getIconContainer("small", stat.gradient as any)}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* KOL Marketplace - 搜索、筛选和列表 */}
      <Card className="overflow-hidden shadow-sm border-gray-200">
        {/* 搜索和筛选区域 */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Search KOLs</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Category</label>
              <div className="flex gap-2">
                <Button
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  onClick={() => setCategoryFilter("all")}
                  size="sm"
                  className="h-9"
                >
                  All
                </Button>
                <Button
                  variant={categoryFilter === "defi" ? "default" : "outline"}
                  onClick={() => setCategoryFilter("defi")}
                  size="sm"
                  className="h-9"
                >
                  DeFi
                </Button>
                <Button
                  variant={categoryFilter === "game" ? "default" : "outline"}
                  onClick={() => setCategoryFilter("game")}
                  size="sm"
                  className="h-9"
                >
                  Game
                </Button>
                <Button
                  variant={categoryFilter === "education" ? "default" : "outline"}
                  onClick={() => setCategoryFilter("education")}
                  size="sm"
                  className="h-9"
                >
                  Education
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 标题栏 */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            KOL Marketplace
          </h2>
          <Badge variant="secondary" className="h-6 px-2 text-xs font-medium bg-gray-100 text-gray-700">
            {filteredKOLs.length} {filteredKOLs.length === 1 ? 'KOL' : 'KOLs'}
          </Badge>
        </div>

        {/* KOL 卡片网格 */}
        <div className="bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKOLs.map((kol) => (
              <Link key={kol.id} href={`/kol/marketplace/${kol.id}`}>
                <Card className="group border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      {/* KOL 头像和基本信息 */}
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-gray-200 ring-2 ring-transparent group-hover:ring-blue-500 transition-all">
                          <AvatarImage
                            src={`https://randomuser.me/api/portraits/men/${kol.id}.jpg`}
                            alt={kol.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                            {kol.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {kol.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-gray-600">{kol.spread_index}</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">{kol.follower_all} followers</span>
                          </div>
                        </div>
                      </div>

                      {/* 代表作品 */}
                      <div className="grid grid-cols-2 gap-2">
                        {kol.masterpiece_works.map((work) => (
                          <div
                            key={work.id}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform"
                          >
                            <img
                              src={work.cover}
                              alt="Work"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2">
                        {kol.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>

                      {/* 统计信息和价格 */}
                      <div className="border-t border-gray-100 pt-4 mt-auto">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Est. CPM</p>
                            <p className="text-sm font-semibold text-gray-900">{kol.prospective_cmp}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Est. Views</p>
                            <p className="text-sm font-semibold text-gray-900">{kol.prospective_vv}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Price (21-60s)</p>
                            <p className="text-2xl font-bold text-green-600">{kol.offer_price}</p>
                          </div>
                          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl">
                            Book Now
                            <ArrowUpRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* 空状态 */}
            {filteredKOLs.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No KOLs found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}


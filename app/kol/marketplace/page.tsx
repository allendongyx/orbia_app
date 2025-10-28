"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Eye,
  Play,
  Star,
  ArrowUpRight,
  Sparkles,
  UserPlus,
  Edit,
  Info,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIconContainer, cardStyles } from "@/lib/design-system";
import { getKolList, getKolInfo, KolInfo as ApiKolInfo } from "@/lib/api/kol";
import { isSuccessResponse, BaseResp } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { DictionaryText } from "@/components/common/dictionary-text";
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
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dataSource, setDataSource] = useState<KOL[]>(data as KOL[]);
  const [kolList, setKolList] = useState<ApiKolInfo[]>([]);
  const [loadingKolList, setLoadingKolList] = useState(true);

  // 从 user 中获取 KOL 信息
  const myKolInfo = user?.kol_info || null;

  // 加载 KOL 列表
  useEffect(() => {
    loadKolList();
  }, [categoryFilter]);

  const loadKolList = async () => {
    setLoadingKolList(true);
    try {
      const result = await getKolList({
        status: 'approved',
        tag: categoryFilter === 'all' ? undefined : categoryFilter,
        page: 1,
        page_size: 50,
      });
      
      console.log('=== KOL List API Debug ===');
      console.log('完整响应:', result);
      console.log('响应类型:', typeof result);
      console.log('响应键:', Object.keys(result));
      
      // 检查是否有嵌套的 data 字段
      const actualData = ((result as unknown as Record<string, unknown>).data || result) as unknown as Record<string, unknown>;
      console.log('实际数据:', actualData);
      console.log('base_resp:', actualData.base_resp);
      console.log('kol_list:', actualData.kol_list);
      console.log('kol_list 类型:', Array.isArray(actualData.kol_list));
      console.log('kol_list 长度:', (actualData.kol_list as unknown[])?.length);
      
      if (actualData.base_resp && isSuccessResponse(actualData.base_resp as BaseResp)) {
        const list = (actualData.kol_list as ApiKolInfo[]) || [];
        console.log('✅ 成功！设置 KOL 列表，包含', list.length, '项');
        console.log('第一个 KOL:', list[0]);
        setKolList(list);
      } else {
        console.error('❌ API 返回错误:', actualData.base_resp);
      }
    } catch (err) {
      console.error('❌ 加载 KOL 列表失败:', err);
    } finally {
      setLoadingKolList(false);
    }
  };

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

  // 过滤 KOL - 优先使用 API 数据，如果没有则使用本地数据
  const displayKolList = kolList.length > 0 ? kolList : [];
  
  const filteredKOLs = displayKolList.filter((kol) => {
    const matchesSearch = kol.display_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // 获取 KOL 状态 Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 border-0">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* KOL 介绍和申请/管理入口 */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className={getIconContainer("large", "blue")}>
              <Users className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {myKolInfo ? "Your KOL Profile" : "Become a KOL"}
              </h2>
              <p className="text-gray-600 text-sm">
                {myKolInfo ? (
                  <>
                    Manage your profile, showcase your content, and connect with Web3 projects. 
                    {myKolInfo.status === 'pending' && " Your application is currently under review."}
                    {myKolInfo.status === 'rejected' && myKolInfo.reject_reason && ` Application rejected: ${myKolInfo.reject_reason}`}
                  </>
                ) : (
                  "Have TikTok fans? Join our KOL marketplace, create content for Web3 projects, and earn money. Apply now to get started!"
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {myKolInfo ? (
                <>
                  {getStatusBadge(myKolInfo.status)}
                  <Button
                    onClick={() => router.push('/kol/profile')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {myKolInfo.status === 'approved' ? 'Manage Profile' : 'View Application'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    if (isLoggedIn) {
                      // 已登录，跳转到申请页面
                      router.push('/kol/apply');
                    } else {
                      // 未登录，先打开登录模态框
                      window.dispatchEvent(new Event('openLoginModal'));
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>


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
          {loadingKolList ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading KOLs...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKOLs.map((kol) => (
                <Link key={kol.id} href={`/kol/marketplace/${kol.id}`}>
                  <Card className="group border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        {/* KOL 头像和基本信息 */}
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16 border-2 border-gray-200 ring-2 ring-transparent group-hover:ring-blue-500 transition-all flex-shrink-0">
                            <AvatarImage
                              src={kol.avatar_url || `https://randomuser.me/api/portraits/men/${kol.id}.jpg`}
                              alt={kol.display_name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                              {kol.display_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {kol.display_name}
                              </h3>
                              {kol.status === 'approved' && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                {kol.stats?.total_followers 
                                  ? `${(kol.stats.total_followers / 1000000).toFixed(1)}M`
                                  : "N/A"
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 描述 */}
                        {kol.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                            {kol.description}
                          </p>
                        )}

                        {/* 国家和语言 */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {kol.country && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                              <MapPin className="h-3 w-3" />
                              <DictionaryText 
                                dictionaryCode="COUNTRY" 
                                code={kol.country} 
                                fallback={kol.country} 
                              />
                            </div>
                          )}
                          {kol.languages && kol.languages.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                              <Languages className="h-3 w-3" />
                              {kol.languages.slice(0, 2).map((l, idx) => (
                                <React.Fragment key={l.language_code}>
                                  {idx > 0 && ", "}
                                  <DictionaryText 
                                    dictionaryCode="LANGUAGE" 
                                    code={l.language_code} 
                                    fallback={l.language_name} 
                                  />
                                </React.Fragment>
                              ))}
                              {kol.languages.length > 2 && ` +${kol.languages.length - 2}`}
                            </div>
                          )}
                        </div>

                        {/* 标签 */}
                        {kol.tags && kol.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {kol.tags.slice(0, 3).map((tag, idx) => (
                              <Badge
                                key={idx}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 text-xs"
                              >
                                {tag.tag}
                              </Badge>
                            ))}
                            {kol.tags.length > 3 && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                                +{kol.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* 互动提示 */}
                        <div className="border-t border-gray-100 pt-3 mt-auto">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 group-hover:text-blue-600 transition-colors">
                              点击查看详情
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {/* 空状态 */}
              {filteredKOLs.length === 0 && !loadingKolList && (
                <div className="col-span-full py-16 text-center">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {kolList.length === 0 ? 'No approved KOLs yet' : 'No KOLs found'}
                  </h3>
                  <p className="text-gray-600">
                    {kolList.length === 0 
                      ? 'There are no approved KOLs at the moment. Please check back later.'
                      : 'Try adjusting your search or filter to find what you\'re looking for.'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    (Check browser console for API debug information)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}


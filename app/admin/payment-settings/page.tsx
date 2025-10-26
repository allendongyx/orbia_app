"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Plus,
  Wallet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getIconContainer } from "@/lib/design-system";
import { isSuccessResponse } from "@/lib/api-client";
import { WalletCard } from "@/components/admin/wallet-card";
import type { PaymentWallet, BlockchainNetwork } from "@/types/payment";
import { getSupportedNetworks, getNetworkConfig, convertAPIWalletToUI, convertUIWalletToAPI } from "@/types/payment";
import {
  getPaymentSettings,
  createPaymentSetting,
  updatePaymentSetting,
  deletePaymentSetting,
} from "@/lib/api/payment-setting";

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  
  const [wallets, setWallets] = useState<PaymentWallet[]>([]);
  const [loading, setLoading] = useState(false);

  // 创建/编辑对话框
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingWallet, setEditingWallet] = useState<PaymentWallet | null>(null);
  const [formData, setFormData] = useState({
    network: "" as BlockchainNetwork | "",
    address: "",
    label: "",
    status: "active" as "active" | "inactive",
  });

  // 删除确认对话框
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingWallet, setDeletingWallet] = useState<PaymentWallet | null>(null);

  const supportedNetworks = getSupportedNetworks();

  // 加载钱包列表
  useEffect(() => {
    loadWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWallets = async () => {
    setLoading(true);
    try {
      const result = await getPaymentSettings({
        page: 1,
        page_size: 1000, // 获取所有钱包
      });

      if (isSuccessResponse(result.base_resp)) {
        // 转换API数据为UI数据
        const list = result.list || [];
        const uiWallets = list
          .map(convertAPIWalletToUI)
          .filter((w): w is PaymentWallet => w !== null);
        setWallets(uiWallets);
      } else {
        toast({
          variant: "error",
          title: "加载失败",
          description: result.base_resp.message || "加载失败",
        });
        setWallets([]);
      }
    } catch (error) {
      console.error("Load wallets error:", error);
      toast({
        variant: "error",
        title: "加载失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingWallet(null);
    setFormData({
      network: "",
      address: "",
      label: "",
      status: "active",
    });
    setShowEditDialog(true);
  };

  const openEditDialog = (wallet: PaymentWallet) => {
    setEditingWallet(wallet);
    setFormData({
      network: wallet.network,
      address: wallet.address,
      label: wallet.label || "",
      status: wallet.status,
    });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    // 验证
    if (!formData.network) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "请选择区块链网络",
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "请输入钱包地址",
      });
      return;
    }

    try {
      if (editingWallet) {
        // 更新
        const apiData = convertUIWalletToAPI({
          network: formData.network as BlockchainNetwork,
          address: formData.address,
          label: formData.label,
          status: formData.status,
        });

        const result = await updatePaymentSetting({
          id: editingWallet.id,
          ...apiData,
        });

        if (isSuccessResponse(result.base_resp)) {
          toast({
            title: "更新成功",
            description: "收款钱包已更新",
          });
          setShowEditDialog(false);
          loadWallets();
        } else {
          toast({
            variant: "error",
            title: "更新失败",
            description: result.base_resp.message,
          });
        }
      } else {
        // 创建
        const apiData = convertUIWalletToAPI({
          network: formData.network as BlockchainNetwork,
          address: formData.address,
          label: formData.label,
          status: formData.status,
        });

        const result = await createPaymentSetting({
          network: apiData.network!,
          address: apiData.address!,
          label: apiData.label,
          status: apiData.status,
        });

        if (isSuccessResponse(result.base_resp)) {
          toast({
            title: "创建成功",
            description: "收款钱包已添加",
          });
          setShowEditDialog(false);
          loadWallets();
        } else {
          toast({
            variant: "error",
            title: "创建失败",
            description: result.base_resp.message,
          });
        }
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "操作失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    }
  };

  const openDeleteDialog = (wallet: PaymentWallet) => {
    setDeletingWallet(wallet);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingWallet) return;

    try {
      const result = await deletePaymentSetting({ id: deletingWallet.id });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "删除成功",
          description: "收款钱包已删除",
        });
        setShowDeleteDialog(false);
        loadWallets();
      } else {
        toast({
          variant: "error",
          title: "删除失败",
          description: result.base_resp.message,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "删除失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    }
  };

  // 按网络分组
  const groupedWallets = wallets.reduce((acc, wallet) => {
    if (!acc[wallet.network]) {
      acc[wallet.network] = [];
    }
    acc[wallet.network].push(wallet);
    return acc;
  }, {} as Record<BlockchainNetwork, PaymentWallet[]>);

  const stats = [
    {
      title: "总钱包数",
      value: wallets.length.toString(),
      icon: Wallet,
      gradient: "blue",
    },
    {
      title: "启用中",
      value: wallets.filter((w) => w.status === "active").length.toString(),
      icon: CheckCircle,
      gradient: "green",
    },
    {
      title: "已禁用",
      value: wallets.filter((w) => w.status === "inactive").length.toString(),
      icon: XCircle,
      gradient: "gray",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">收款设置</h1>
          <p className="text-gray-600 mt-1">管理用户充值的收款钱包地址</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          添加钱包
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={getIconContainer("small", stat.gradient as "blue" | "green" | "yellow" | "red" | "purple" | "orange" | "gray")}>
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

      {/* 提示信息 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">重要提示</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 请确保钱包地址正确，错误的地址可能导致充值资金丢失</li>
                <li>• 建议为每个网络配置独立的钱包地址</li>
                <li>• 可通过区块链浏览器验证地址的有效性</li>
                <li>• 禁用的钱包将不会显示在用户充值页面</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 钱包列表 */}
      {loading ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          </CardContent>
        </Card>
      ) : wallets.length === 0 ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">暂无收款钱包，点击上方按钮添加</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 按网络分组显示 */}
          {supportedNetworks.map((network) => {
            const networkWallets = groupedWallets[network];
            if (!networkWallets || networkWallets.length === 0) return null;

            const config = getNetworkConfig(network);
            return (
              <div key={network}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.fullName}
                  <span className="text-sm font-normal text-gray-500">
                    ({networkWallets.length} 个钱包)
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {networkWallets.map((wallet) => (
                    <WalletCard
                      key={wallet.id}
                      wallet={wallet}
                      onEdit={openEditDialog}
                      onDelete={openDeleteDialog}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 创建/编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWallet ? "编辑钱包" : "添加收款钱包"}</DialogTitle>
            <DialogDescription>
              {editingWallet
                ? "更新收款钱包信息"
                : "添加新的收款钱包地址"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="network">
                区块链网络 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.network}
                onValueChange={(value) =>
                  setFormData({ ...formData, network: value as BlockchainNetwork })
                }
                disabled={!!editingWallet}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择区块链网络" />
                </SelectTrigger>
                <SelectContent>
                  {supportedNetworks.map((network) => {
                    const config = getNetworkConfig(network);
                    return (
                      <SelectItem key={network} value={network}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          {config.name} - {config.fullName}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {!editingWallet && (
                <p className="text-xs text-gray-500">网络创建后不可修改</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                钱包地址 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="请输入钱包地址"
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                请仔细检查地址，确保准确无误
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">钱包标签</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="如: USDT-TRC20 主钱包"
              />
              <p className="text-xs text-gray-500">
                可选，用于识别和管理不同的钱包
              </p>
            </div>

            {editingWallet && (
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as "active" | "inactive" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editingWallet ? "更新" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除收款钱包</DialogTitle>
            <DialogDescription>
              确定要删除钱包{" "}
              <strong>{deletingWallet?.label || deletingWallet?.address}</strong> 吗？
              <br />
              <span className="text-red-600 font-medium">
                删除后，用户将无法使用此钱包地址进行充值，此操作无法撤销！
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              确定删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


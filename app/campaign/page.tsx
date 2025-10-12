"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2, XCircle, Pause, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface CampaignData {
  id: string;
  name: string;
  status: "active" | "pending" | "paused";
  budget: string;
  spent: string;
  cpc: string;
  cpm: string;
  impressions: string;
  clicks: string;
  ctr: string;
  conversions: number;
}

const initialData: CampaignData[] = [
  {
    id: "1",
    name: "Web3 Gaming Platform Launch",
    status: "active",
    budget: "$1,200",
    spent: "$856",
    cpc: "$0.85",
    cpm: "$4.32",
    impressions: "198,432",
    clicks: "8,765",
    ctr: "4.42%",
    conversions: 234,
  },
  {
    id: "2",
    name: "DeFi Protocol Campaign",
    status: "active",
    budget: "$800",
    spent: "$543",
    cpc: "$0.92",
    cpm: "$5.18",
    impressions: "104,821",
    clicks: "5,234",
    ctr: "4.99%",
    conversions: 156,
  },
  {
    id: "3",
    name: "NFT Marketplace Promotion",
    status: "paused",
    budget: "$600",
    spent: "$412",
    cpc: "$1.12",
    cpm: "$6.45",
    impressions: "63,876",
    clicks: "3,112",
    ctr: "4.87%",
    conversions: 98,
  },
];

// Summary stats
const summaryStats = [
  {
    label: "Total Budget",
    value: "$2,600",
    change: "+12.5%",
    trend: "up" as const,
  },
  {
    label: "Total Spent",
    value: "$1,811",
    change: "+8.3%",
    trend: "up" as const,
  },
  {
    label: "Avg. CPC",
    value: "$0.96",
    change: "-5.2%",
    trend: "down" as const,
  },
  {
    label: "Total Conversions",
    value: "488",
    change: "+15.7%",
    trend: "up" as const,
  },
];

export default function Campaign() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dataSource, setData] = useState<CampaignData[]>(initialData);

  const getStatusBadge = (status: CampaignData["status"]) => {
    const configs = {
      active: {
        label: "Active",
        variant: "default" as const,
        icon: CheckCircle2,
        className: "bg-emerald-500 hover:bg-emerald-600 border-emerald-600",
      },
      pending: {
        label: "Pending",
        variant: "secondary" as const,
        icon: XCircle,
        className: "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white",
      },
      paused: {
        label: "Paused",
        variant: "outline" as const,
        icon: Pause,
        className: "border-gray-400 text-gray-600",
      },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? dataSource.map((row) => row.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  };

  const filteredData = dataSource.filter((row) => {
    const matchesName = nameFilter
      ? row.name.toLowerCase().includes(nameFilter.toLowerCase())
      : true;
    const matchesStatus =
      statusFilter === "all" || row.status === statusFilter;
    return matchesName && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign List with Filters */}
      <Card className="overflow-hidden shadow-sm border-gray-200">
        {/* Filters Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5 flex-1 min-w-[280px]">
              <Label htmlFor="name" className="text-xs font-medium text-gray-700">
                Campaign Name
              </Label>
              <Input
                id="name"
                placeholder="Search campaigns..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5 min-w-[200px]">
              <Label htmlFor="status" className="text-xs font-medium text-gray-700">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status" className="h-9 bg-white border-gray-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">
              Campaigns
            </h2>
            <Badge variant="secondary" className="h-6 px-2 text-xs font-medium bg-gray-100 text-gray-700">
              {filteredData.length}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedRows.length === 0}
              className="gap-2 h-9"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
            <Link href="/campaign/creation">
              <Button size="sm" className="gap-2 h-9">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-50 hover:to-gray-100/50 border-b border-gray-200">
                  <TableHead className="w-12 font-medium text-gray-700">
                    <Checkbox
                      checked={
                        filteredData.length > 0 &&
                        selectedRows.length === filteredData.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700">Campaign Name</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 text-right">Budget</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 text-right">Spent</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 text-right">CPC</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 text-right">CPM</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 text-right">Impressions</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 text-right">Clicks</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 text-right">CTR</TableHead>
                  <TableHead className="font-semibold text-xs text-gray-700 text-right">Conversions</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <p className="text-sm">No campaigns found</p>
                        <Link href="/campaign/creation">
                          <Button variant="outline" size="sm" className="gap-2 mt-2">
                            <Plus className="h-4 w-4" />
                            Create your first campaign
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row) => (
                    <TableRow 
                      key={row.id} 
                      className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(row.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{row.name}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell className="text-right font-medium text-gray-900">{row.budget}</TableCell>
                      <TableCell className="text-right text-gray-700">{row.spent}</TableCell>
                      <TableCell className="text-right text-gray-700">{row.cpc}</TableCell>
                      <TableCell className="text-right text-gray-700">{row.cpm}</TableCell>
                      <TableCell className="text-right text-gray-700">{row.impressions}</TableCell>
                      <TableCell className="text-right text-gray-700">{row.clicks}</TableCell>
                      <TableCell className="text-right text-gray-700">{row.ctr}</TableCell>
                      <TableCell className="text-right text-gray-700">{row.conversions}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}


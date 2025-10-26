/**
 * 支付相关类型定义
 */

// 区块链网络类型
export type BlockchainNetwork = 
  | "TRC20"   // TRON (USDT-TRC20)
  | "ERC20"   // Ethereum (USDT-ERC20)
  | "BEP20"   // BSC (USDT-BEP20)
  | "Polygon" // Polygon (USDT-Polygon)
  | "Arbitrum" // Arbitrum
  | "Optimism" // Optimism
  | "Avalanche" // Avalanche C-Chain
  | "Solana"  // Solana
  | "Bitcoin" // Bitcoin

// 收款钱包信息
export interface PaymentWallet {
  id: number;
  network: BlockchainNetwork;
  address: string;
  label?: string; // 钱包标签/备注
  status: "active" | "inactive"; // 启用/禁用
  created_at: string;
  updated_at: string;
}

// 从后端API获取的收款钱包信息（用于API交互）
export interface PaymentWalletAPI {
  id: number;
  network: string; // 完整的网络名称，如 "TRC-20 - TRON Network (TRC-20)"
  address: string;
  label?: string;
  status: number; // 1-启用, 0-禁用
  created_at: string;
  updated_at: string;
}

// 区块链浏览器配置
export interface BlockchainExplorer {
  name: string;
  baseUrl: string;
  addressPath: string; // 地址查询路径，如 /address/
}

// 网络配置信息
export interface NetworkConfig {
  network: BlockchainNetwork;
  name: string;
  fullName: string;
  icon?: string;
  color: string; // 主题色
  explorers: BlockchainExplorer[];
  tokenStandard?: string; // 代币标准说明
  confirmations?: number; // 确认数
  estimatedTime?: string; // 预计到账时间
}

// 网络配置映射
export const NETWORK_CONFIGS: Record<BlockchainNetwork, NetworkConfig> = {
  TRC20: {
    network: "TRC20",
    name: "TRC-20",
    fullName: "TRON Network (TRC-20)",
    color: "#FF060A",
    tokenStandard: "TRON TRC-20 代币标准",
    confirmations: 19,
    estimatedTime: "1-3 分钟",
    explorers: [
      {
        name: "Tronscan",
        baseUrl: "https://tronscan.org",
        addressPath: "#/address/",
      },
      {
        name: "TronGrid",
        baseUrl: "https://tronscan.io",
        addressPath: "#/address/",
      },
    ],
  },
  ERC20: {
    network: "ERC20",
    name: "ERC-20",
    fullName: "Ethereum Network (ERC-20)",
    color: "#627EEA",
    tokenStandard: "Ethereum ERC-20 代币标准",
    confirmations: 12,
    estimatedTime: "3-5 分钟",
    explorers: [
      {
        name: "Etherscan",
        baseUrl: "https://etherscan.io",
        addressPath: "/address/",
      },
      {
        name: "Blockchair",
        baseUrl: "https://blockchair.com/ethereum",
        addressPath: "/address/",
      },
    ],
  },
  BEP20: {
    network: "BEP20",
    name: "BEP-20",
    fullName: "BNB Smart Chain (BEP-20)",
    color: "#F3BA2F",
    tokenStandard: "BSC BEP-20 代币标准",
    confirmations: 15,
    estimatedTime: "1-2 分钟",
    explorers: [
      {
        name: "BscScan",
        baseUrl: "https://bscscan.com",
        addressPath: "/address/",
      },
    ],
  },
  Polygon: {
    network: "Polygon",
    name: "Polygon",
    fullName: "Polygon Network",
    color: "#8247E5",
    tokenStandard: "Polygon ERC-20 标准",
    confirmations: 128,
    estimatedTime: "2-5 分钟",
    explorers: [
      {
        name: "Polygonscan",
        baseUrl: "https://polygonscan.com",
        addressPath: "/address/",
      },
    ],
  },
  Arbitrum: {
    network: "Arbitrum",
    name: "Arbitrum",
    fullName: "Arbitrum One",
    color: "#28A0F0",
    tokenStandard: "Arbitrum Layer 2",
    confirmations: 1,
    estimatedTime: "< 1 分钟",
    explorers: [
      {
        name: "Arbiscan",
        baseUrl: "https://arbiscan.io",
        addressPath: "/address/",
      },
    ],
  },
  Optimism: {
    network: "Optimism",
    name: "Optimism",
    fullName: "Optimism Network",
    color: "#FF0420",
    tokenStandard: "Optimism Layer 2",
    confirmations: 1,
    estimatedTime: "< 1 分钟",
    explorers: [
      {
        name: "Optimistic Etherscan",
        baseUrl: "https://optimistic.etherscan.io",
        addressPath: "/address/",
      },
    ],
  },
  Avalanche: {
    network: "Avalanche",
    name: "Avalanche",
    fullName: "Avalanche C-Chain",
    color: "#E84142",
    tokenStandard: "Avalanche C-Chain",
    confirmations: 1,
    estimatedTime: "< 1 分钟",
    explorers: [
      {
        name: "SnowTrace",
        baseUrl: "https://snowtrace.io",
        addressPath: "/address/",
      },
    ],
  },
  Solana: {
    network: "Solana",
    name: "Solana",
    fullName: "Solana Network",
    color: "#00D4AA",
    tokenStandard: "Solana SPL Token",
    confirmations: 32,
    estimatedTime: "< 1 分钟",
    explorers: [
      {
        name: "Solscan",
        baseUrl: "https://solscan.io",
        addressPath: "/address/",
      },
      {
        name: "Solana Explorer",
        baseUrl: "https://explorer.solana.com",
        addressPath: "/address/",
      },
    ],
  },
  Bitcoin: {
    network: "Bitcoin",
    name: "Bitcoin",
    fullName: "Bitcoin Network",
    color: "#F7931A",
    tokenStandard: "Bitcoin",
    confirmations: 3,
    estimatedTime: "30-60 分钟",
    explorers: [
      {
        name: "Blockchain.com",
        baseUrl: "https://www.blockchain.com/explorer",
        addressPath: "/addresses/btc/",
      },
      {
        name: "Blockchair",
        baseUrl: "https://blockchair.com/bitcoin",
        addressPath: "/address/",
      },
    ],
  },
};

// 获取网络配置
export function getNetworkConfig(network: BlockchainNetwork): NetworkConfig {
  return NETWORK_CONFIGS[network];
}

// 获取所有支持的网络
export function getSupportedNetworks(): BlockchainNetwork[] {
  return Object.keys(NETWORK_CONFIGS) as BlockchainNetwork[];
}

// 构建区块链浏览器URL
export function buildExplorerUrl(network: BlockchainNetwork, address: string, explorerIndex = 0): string {
  const config = getNetworkConfig(network);
  const explorer = config.explorers[explorerIndex];
  if (!explorer) return "";
  
  return `${explorer.baseUrl}${explorer.addressPath}${address}`;
}

// 从完整网络名称提取网络类型
// 例如: "TRC-20 - TRON Network (TRC-20)" => "TRC20"
export function parseNetworkFromFullName(fullName: string): BlockchainNetwork | null {
  const networkMap: Record<string, BlockchainNetwork> = {
    'TRC-20': 'TRC20',
    'TRC20': 'TRC20',
    'ERC-20': 'ERC20',
    'ERC20': 'ERC20',
    'BEP-20': 'BEP20',
    'BEP20': 'BEP20',
    'Polygon': 'Polygon',
    'Arbitrum': 'Arbitrum',
    'Optimism': 'Optimism',
    'Avalanche': 'Avalanche',
    'Solana': 'Solana',
    'Bitcoin': 'Bitcoin',
  };

  for (const [key, value] of Object.entries(networkMap)) {
    if (fullName.includes(key)) {
      return value;
    }
  }
  
  return null;
}

// 将API数据转换为UI数据
export function convertAPIWalletToUI(apiWallet: PaymentWalletAPI): PaymentWallet | null {
  const network = parseNetworkFromFullName(apiWallet.network);
  if (!network) return null;

  return {
    id: apiWallet.id,
    network,
    address: apiWallet.address,
    label: apiWallet.label,
    status: apiWallet.status === 1 ? 'active' : 'inactive',
    created_at: apiWallet.created_at,
    updated_at: apiWallet.updated_at,
  };
}

// 将UI数据转换为API数据
export function convertUIWalletToAPI(uiWallet: Partial<PaymentWallet> & { network: BlockchainNetwork }): Partial<PaymentWalletAPI> {
  const config = getNetworkConfig(uiWallet.network);
  
  return {
    network: `${config.name} - ${config.fullName}`,
    address: uiWallet.address,
    label: uiWallet.label,
    status: uiWallet.status === 'active' ? 1 : 0,
  };
}


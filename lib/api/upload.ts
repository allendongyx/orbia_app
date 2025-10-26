import apiClient, { BaseResp } from "../api-client";

// 生成上传token请求
export interface GenerateUploadTokenReq {
  file_extension: string; // 文件扩展名，如 .jpg, .png（会自动转为小写）
  file_size?: number; // 文件大小（字节）
}

// 生成上传token响应
export interface GenerateUploadTokenResp {
  upload_url: string; // 预签名上传URL（使用PUT方法）
  public_url: string; // 上传成功后的公开访问URL
  expires_in: number; // 过期时间（秒）
  headers: Record<string, string>; // 上传时必需的HTTP请求头
  base_resp: BaseResp;
}

// 验证文件URL请求
export interface ValidateFileURLReq {
  file_url: string;
}

// 验证文件URL响应
export interface ValidateFileURLResp {
  is_valid: boolean;
  error_message?: string;
  base_resp: BaseResp;
}

/**
 * 生成上传 Token
 * 
 * 根据文件扩展名自动识别文件类型并生成预签名上传 URL
 * 文件路径由服务器自动管理，格式：{目录}/{年月}/{时间戳}_{随机数}.{扩展名}
 */
export async function generateUploadToken(
  req: GenerateUploadTokenReq
): Promise<GenerateUploadTokenResp> {
  return apiClient.post("/api/v1/upload/token", req);
}

/**
 * 验证文件 URL
 */
export async function validateFileURL(
  req: ValidateFileURLReq
): Promise<ValidateFileURLResp> {
  return apiClient.post("/api/v1/upload/validate", req);
}


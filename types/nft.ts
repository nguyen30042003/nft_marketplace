// Enum for different states of a copyright registration
export enum Status {
  UPLOADED = "UPLOADED",
  PENDING = "PENDING",
  INCOMPLETED = "INCOMPLETED",
  REJECTED = "REJECTED",
  APPROVED = "APPROVED",
  PUBLISHED = "PUBLISHED",
}

export type Trait = "attack" | "health" | "speed";

export type NftAttribute = {
  trait_type: Trait;
  value: string;
};

export type NftMeta = {
  uri: string;
  name: string;
  description: string;  
  samples: string;
  applicationForm: string;
  createAt: string;
};

export type NftCore = {
  tokenId: number;
  price: number;
  creator: string;
  isListed: boolean;
};

export type Nft = {
  meta: NftMeta;
} & NftCore;

export type FileReq = {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
};

export type PinataRes = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
};

// User structure
export interface User {
  username: string;
  address: string;
  email: string;
  role: "USER" | "ADMIN"; // Giới hạn giá trị role
  isApprove: boolean;
}

// CopyRight entity
export interface CopyRight {
  id: string;
  status: Status; // Sử dụng enum Status
  user: User;
  metaData: NftMeta; // Sử dụng lại NftMeta để tránh trùng lặp
  tokenId: string
}

export interface CopyRightRequest {
  status: Status; 
  userAddress: String;
  metaData: NftMeta;
  tokenId: String
}


// Array of CopyRight entities
export type CopyRights = CopyRight[];

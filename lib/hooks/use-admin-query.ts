import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  UseQueryResult,
  QueryObserverResult,
  DefinedUseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "../api-client";

type AdminStats = {
  success: boolean;
  statistics: {
    users: {
      total: number;
      active: number;
      inactive: number;
    };
    packages: {
      total: number;
      active: number;
      expired: number;
    };
    financial: {
      totalInvested: number;
      totalWithdrawals: number;
      totalEarnings: number;
      pendingWithdrawals: number;
    };
    bots: {
      active: number;
    };
  };
  recentActivity: {
    users: Array<{
      id: string;
      email: string;
      username: string;
      createdAt: string;
    }>;
    packages: Array<{
      id: string;
      amount: number;
      packageType: string;
      status: string;
      createdAt: string;
      user: {
        email: string;
        username: string;
      };
    }>;
  };
  packagesByType: Array<{
    type: string;
    count: number;
    totalAmount: number;
  }>;
};

type User = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  referralCode: string;
  isActive: boolean;
  isBlocked: boolean;
  isEmailVerified: boolean;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  lastLogin: string | null;
  totalInvested: number;
  totalEarnings: number;
  totalPackages: number;
  totalReferrals: number;
};

type Withdrawal = {
  id: string;
  userId: string;
  amount: number;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";
  walletAddress: string;
  network: "BEP20" | "TRC20";
  createdAt: string;
  updatedAt: string;
};

type KYCSubmission = {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  documentType: "PASSPORT" | "DRIVING_LICENSE" | "NATIONAL_ID";
  documentNumber: string;
  documentUrl: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "email" | "username">;
};

export const useAdminStats = (
  options?: Omit<UseQueryOptions<AdminStats, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<AdminStats, Error>({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.get<AdminStats>("/admin/stats").then((res) => res),
    refetchInterval: 60000, // Refetch every 60 seconds instead of 30
    retry: 2, // Only retry twice
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 30000, // Consider data stale after 30 seconds
    ...options,
  });
};

// New hook for financial stats
export const useFinancialStats = (
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["admin", "financial-stats"],
    queryFn: () => apiClient.get("/admin/financial-stats").then((res) => res),
    refetchInterval: 120000, // Refetch every 2 minutes
    retry: 1, // Only retry once for financial stats
    retryDelay: 2000,
    staleTime: 60000,
    ...options,
  });
};

// New hook for package types
export const usePackageTypes = (
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["admin", "package-types"],
    queryFn: () => apiClient.get("/admin/package-types").then((res) => res),
    refetchInterval: 300000, // Refetch every 5 minutes (less frequent)
    retry: 1,
    retryDelay: 2000,
    staleTime: 180000, // 3 minutes stale time
    ...options,
  });
};

type UsersResponse = {
  success: boolean;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type UsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "blocked" | "all";
  kycStatus?: "PENDING" | "APPROVED" | "REJECTED";
};

export const useUsers = (
  params: UsersParams = {},
  options?: Omit<UseQueryOptions<UsersResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<UsersResponse, Error>({
    queryKey: ["admin", "users", params],
    queryFn: () =>
      apiClient
        .get<UsersResponse>("/admin/users", { params })
        .then((res) => res),
    ...options,
  });
};

type UpdateUserData = {
  isActive?: boolean;
  isBlocked?: boolean;
  kycStatus?: "PENDING" | "APPROVED" | "REJECTED";
  fullName?: string;
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
      apiClient.put<User>(`/admin/users/${userId}`, data).then((res) => res),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

type WithdrawalsResponse = {
  withdrawals: Withdrawal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type WithdrawalsParams = {
  page?: number;
  limit?: number;
  status?: string;
  network?: string;
  sortBy?: string;
  order?: "asc" | "desc";
};

export const useWithdrawals = (
  params: WithdrawalsParams = {},
  options?: Omit<
    UseQueryOptions<WithdrawalsResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<WithdrawalsResponse, Error>({
    queryKey: ["admin", "withdrawals", params],
    queryFn: () =>
      apiClient
        .get<WithdrawalsResponse>("/admin/withdrawals", { params })
        .then((res) => res),
    ...options,
  });
};

export const useUpdateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      withdrawalId,
      status,
    }: {
      withdrawalId: string;
      status: Withdrawal["status"];
    }) =>
      apiClient
        .put<Withdrawal>(`/admin/withdrawals/${withdrawalId}`, { status })
        .then((res) => res),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
};

type KYCResponse = {
  submissions: KYCSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type KYCParams = {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  limit?: number;
  search?: string;
};

export const useKYCSubmissions = (
  params: KYCParams = { status: "PENDING" },
  options?: Omit<UseQueryOptions<KYCResponse, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<KYCResponse, Error>({
    queryKey: ["admin", "kyc", params],
    queryFn: () =>
      apiClient.get<KYCResponse>("/admin/kyc", { params }).then((res) => res),
    ...options,
  });
};

export const useUpdateKYCStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      status,
      reason,
    }: {
      submissionId: string;
      status: KYCSubmission["status"];
      reason?: string;
    }) =>
      apiClient
        .put<KYCSubmission>(`/admin/kyc/${submissionId}`, { status, reason })
        .then((res) => res),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
  });
};

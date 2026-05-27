import axiosInstance from './axios';

// ─── 공통 DTO ────────────────────────────────────────────────────────────────

type PlaceStateDto = {
  placeId: number;
  name: string;
  address: string;
  category: string;
  estimatedCost: number;
  stayDurationMin: number;
  latitude: number;
  longitude: number;
  orderIndex: number;
};

type DayStateDto = {
  dayId: number;
  dayNumber: number;
  date: string;
  places: PlaceStateDto[];
};

type ParticipantDto = {
  memberId: number;
  nickname: string;
};

type EditLockDto = {
  placeId: number;
  memberId: number;
  nickname: string;
};

// ─── 응답 타입 ────────────────────────────────────────────────────────────────

/** GET /api/v1/plans — 내 플랜 목록 */
export type PlanSummaryDto = {
  planId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'CONFIRMED';
};

/** GET /api/v1/plans/{planId} — 플랜 상세 (초기 렌더링용, 참여자·잠금 정보 없음) */
export type PlanDetailResponse = {
  planId: number;
  title: string;
  destination: string;
  days: DayStateDto[];
};

/** GET /api/v1/plans/{planId}/state — 재연결 동기화용 (참여자·잠금 포함) */
export type PlanStateResponse = {
  planId: number;
  title: string;
  destination: string;
  days: DayStateDto[];
  participants: ParticipantDto[];
  editLocks: EditLockDto[];
};

/** GET /api/v1/plans/shared/{token} — 공유 링크로 기본 정보 조회 */
export type SharedPlanResponse = {
  planId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
};

/** POST /api/v1/plans/{planId}/share — 공유 링크 생성 */
export type ShareLinkResponse = {
  shareToken: string;
  shareUrl: string;
};

// ─── API 함수 ────────────────────────────────────────────────────────────────

/** 내 플랜 목록 조회 */
export const getMyPlans = async (): Promise<PlanSummaryDto[]> => {
  const { data } = await axiosInstance.get<PlanSummaryDto[]>('/api/v1/plans');
  return data;
};

/** 플랜 상세 조회 (초기 렌더링용) */
export const getPlanDetail = async (planId: number): Promise<PlanDetailResponse> => {
  const { data } = await axiosInstance.get<PlanDetailResponse>(`/api/v1/plans/${planId}`);
  return data;
};

/** 플랜 전체 현재 상태 조회 (재연결 동기화용) */
export const getPlanState = async (planId: number): Promise<PlanStateResponse> => {
  const { data } = await axiosInstance.get<PlanStateResponse>(`/api/v1/plans/${planId}/state`);
  return data;
};

/** 공유 링크로 플랜 기본 정보 조회 */
export const getSharedPlan = async (token: string): Promise<SharedPlanResponse> => {
  const { data } = await axiosInstance.get<SharedPlanResponse>(`/api/v1/plans/shared/${token}`);
  return data;
};

/** 공유 링크 생성 */
export const createShareLink = async (planId: number): Promise<ShareLinkResponse> => {
  const { data } = await axiosInstance.post<ShareLinkResponse>(`/api/v1/plans/${planId}/share`);
  return data;
};

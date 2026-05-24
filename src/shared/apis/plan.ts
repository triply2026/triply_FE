import axiosInstance from './axios';

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

export type PlanStateResponse = {
  planId: number;
  title: string;
  destination: string;
  days: DayStateDto[];
  participants: ParticipantDto[];
  editLocks: EditLockDto[];
};

export type SharedPlanResponse = {
  planId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
};

export const getPlanState = async (planId: number): Promise<PlanStateResponse> => {
  const { data } = await axiosInstance.get<PlanStateResponse>(`/api/v1/plans/${planId}/state`);
  return data;
};

export const getSharedPlan = async (token: string): Promise<SharedPlanResponse> => {
  const { data } = await axiosInstance.get<SharedPlanResponse>(`/api/v1/plans/shared/${token}`);
  return data;
};

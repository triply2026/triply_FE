import axiosInstance from './axios';

export type TripStyle = 'RELAXATION' | 'ADVENTURE' | 'CULTURE' | 'FOOD' | 'NATURE' | 'SHOPPING';

type ItineraryRequest = {
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget?: number;
  tripStyle?: TripStyle;
};

type PlacePlan = {
  name: string;
  address: string;
  category: string;
  estimatedCost: number;
  stayDurationMin: number;
  description: string;
};

type DayPlan = {
  dayNumber: number;
  date: string;
  places: PlacePlan[];
};

export type ItineraryResponse = {
  days: DayPlan[];
};

export const generateItinerary = async (requestBody: ItineraryRequest): Promise<ItineraryResponse> => {
  const { data } = await axiosInstance.post<ItineraryResponse>(
    '/api/v1/ai/itinerary/generate',
    requestBody,
  );
  return data;
};

const API_BASE_URL = import.meta.env.PROD ? (import.meta.env.VITE_API_BASE_URL ?? '') : '';

export type TripStyle = 'RELAXATION' | 'ADVENTURE' | 'CULTURE' | 'FOOD' | 'NATURE' | 'SHOPPING';

export type GenerateItineraryRequest = {
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  tripStyle: TripStyle;
};

export type GeneratedPlace = {
  name: string;
  address: string;
  category: string;
  estimatedCost: number;
  stayDurationMin: number;
  description: string;
};

export type GeneratedDay = {
  dayNumber: number;
  date: string;
  places: GeneratedPlace[];
};

export type GenerateItineraryResponse = {
  planId: number;
  days: GeneratedDay[];
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

export class ItineraryApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ItineraryApiError';
    this.status = status;
  }
}

const parseErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    const body = (await response.json()) as ApiErrorBody;
    return body.message ?? body.error;
  }

  const message = await response.text();
  return message || undefined;
};

export const generateItinerary = async (
  requestBody: GenerateItineraryRequest,
  signal?: AbortSignal,
): Promise<GenerateItineraryResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/itinerary/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal,
  });

  if (!response.ok) {
    const errorMessage = await parseErrorMessage(response);
    throw new ItineraryApiError(response.status, errorMessage ?? 'AI 일정 생성에 실패했습니다.');
  }

  return response.json() as Promise<GenerateItineraryResponse>;
};

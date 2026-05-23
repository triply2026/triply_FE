const API_BASE_URL = import.meta.env.PROD ? (import.meta.env.VITE_API_BASE_URL ?? '') : '';

export type PlaceVoteType = 'LIKE' | 'DISLIKE';

export type PlaceVoteSummary = {
  placeId: number;
  likeCount: number;
  dislikeCount: number;
  likeRatio: number;
  dislikeRatio: number;
  myVoteType: PlaceVoteType | null;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

export class PlaceVoteApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'PlaceVoteApiError';
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

const assertOk = async (response: Response, fallbackMessage: string) => {
  if (response.ok) return;

  const errorMessage = await parseErrorMessage(response);
  throw new PlaceVoteApiError(response.status, errorMessage ?? fallbackMessage);
};

export const createOrChangePlaceVote = async (
  placeId: number,
  voteType: PlaceVoteType,
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/places/${placeId}/votes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ voteType }),
  });

  await assertOk(response, '장소 투표에 실패했습니다.');
};

export const cancelPlaceVote = async (placeId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/places/${placeId}/votes`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  });

  await assertOk(response, '장소 투표 취소에 실패했습니다.');
};

export const getPlaceVoteSummary = async (placeId: number): Promise<PlaceVoteSummary> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/places/${placeId}/votes/summary`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  await assertOk(response, '장소 투표 집계 조회에 실패했습니다.');

  return response.json() as Promise<PlaceVoteSummary>;
};

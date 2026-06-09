import axiosInstance from './axios';

export type PlaceDetailResponse = {
  placeId: number;
  name: string;
  category: string;
  address: string;
  description: string | null;
  estimatedDuration: number;
  estimatedCost: number;
  memo: string | null;
  reservationUrl: string | null;
  sourceUrls: string[] | null;
  images: string[] | null;
  likeCount: number;
  dislikeCount: number;
  myVoteType: 'LIKE' | 'DISLIKE' | null;
};

/** GET /api/v1/places/{placeId} — 장소 상세 조회 */
export const getPlaceDetail = async (placeId: number): Promise<PlaceDetailResponse> => {
  const { data } = await axiosInstance.get<PlaceDetailResponse>(`/api/v1/places/${placeId}`);
  return data;
};

/** DELETE /api/v1/places/{placeId} — 장소 삭제 */
export const deletePlaceById = async (placeId: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/places/${placeId}`);
};

import axiosInstance from './axios';

/** DELETE /api/v1/places/{placeId} — 장소 삭제 */
export const deletePlaceById = async (placeId: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/places/${placeId}`);
};

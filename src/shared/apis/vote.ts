import axiosInstance from './axios';

type VoteType = 'LIKE' | 'DISLIKE';

export type VoteSummary = {
  placeId: number;
  likeCount: number;
  dislikeCount: number;
  likeRatio: number;
  dislikeRatio: number;
  myVoteType: VoteType | null;
};

type VoteDeleted = {
  placeId: number;
  message: string;
};

export const vote = async (placeId: number, voteType: VoteType): Promise<void> => {
  await axiosInstance.post(`/api/v1/places/${placeId}/votes`, { voteType });
};

export const cancelVote = async (placeId: number): Promise<VoteDeleted> => {
  const { data } = await axiosInstance.delete<VoteDeleted>(`/api/v1/places/${placeId}/votes`);
  return data;
};

export const getVoteSummary = async (placeId: number): Promise<VoteSummary> => {
  const { data } = await axiosInstance.get<VoteSummary>(`/api/v1/places/${placeId}/votes/summary`);
  return data;
};

export const getVoteSummaries = async (placeIds: number[]): Promise<VoteSummary[]> => {
  const { data } = await axiosInstance.get<VoteSummary[]>('/api/v1/votes/summary', {
    params: { placeIds },
  });
  return data;
};

export const getPlaceIdsSortedByVotes = async (dayId: number): Promise<number[]> => {
  const { data } = await axiosInstance.get<number[]>(`/api/v1/days/${dayId}/votes/sorted-place-ids`);
  return data;
};

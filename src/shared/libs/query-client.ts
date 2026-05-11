import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 윈도우가 다시 포커스 될때 새로고침 하는지 유뮤
      retry: 1, // 데이터 가져올때 실패시 시도 횟수
    },
  },
});

export default queryClient;

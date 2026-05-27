const API_BASE_URL = import.meta.env.PROD ? (import.meta.env.VITE_API_BASE_URL ?? '') : '';

type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
};

type SignupResponse = {
  id: number;
  email: string;
  nickname: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type MemberInfo = {
  id: number;
  email: string;
  nickname: string;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
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

export const signup = async (requestBody: SignupRequest): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorMessage(response);
    throw new ApiError(response.status, errorMessage ?? '회원가입에 실패했습니다.');
  }

  return response.json() as Promise<SignupResponse>;
};

export const login = async (requestBody: LoginRequest): Promise<MemberInfo> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorMessage = await parseErrorMessage(response);
    throw new ApiError(response.status, errorMessage ?? '로그인에 실패했습니다.');
  }

  return response.json() as Promise<MemberInfo>;
};

export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorMessage = await parseErrorMessage(response);
    throw new ApiError(response.status, errorMessage ?? '로그아웃에 실패했습니다.');
  }
};

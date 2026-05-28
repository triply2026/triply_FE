import { X } from 'lucide-react';
import { useId } from 'react';

type LoginRequiredModalProps = {
  onClose: () => void;
  message?: string;
};

export function LoginRequiredModal({ onClose, message }: LoginRequiredModalProps) {
  const titleId = useId();

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="dialog login-required-dialog"
        role="dialog"
      >
        <button
          className="login-required-dialog__close"
          onClick={onClose}
          type="button"
          aria-label="모달 닫기"
        >
          <X aria-hidden="true" size={18} strokeWidth={2} />
        </button>
        <h2 className="login-required-dialog__title" id={titleId}>
          로그인이 필요합니다
        </h2>
        <p className="login-required-dialog__message">
          {message ?? 'AI 일정 만들기는 로그인 후 이용할 수 있어요.'}
        </p>
        <div className="login-required-dialog__actions">
          <a className="btn btn--primary btn--sm login-required-dialog__login" href="/login">
            로그인 하기
          </a>
        </div>
      </section>
    </div>
  );
}

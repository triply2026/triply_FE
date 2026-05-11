import triplyLogo from '@assets/icons/triply-logo.svg';

type LogoProps = {
  className?: string;
  size?: 'default' | 'large';
};

export function Logo({ className = '', size = 'default' }: LogoProps) {
  return (
    <a
      className={`logo ${size === 'large' ? 'logo--large' : ''} ${className}`}
      href="/"
      aria-label="Triply 홈"
    >
      <img src={triplyLogo} width="100" height="30" alt="Triply" />
    </a>
  );
}

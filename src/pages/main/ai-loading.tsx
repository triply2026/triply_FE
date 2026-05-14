import loadingBackground from "@assets/backgrounds/loading-background.svg"
import LoadingSpinner from "@assets/icons/loading.svg?react";

const AiLoading = () => {
  return (
    <main>
      <img className="page__background landing-shell__background" src={loadingBackground} alt="로딩 이미지"/>
      <section className="landing-hero flex-col-center gap-2">
        <LoadingSpinner className="w-500"/>
        <div className="flex-col gap-2">
          <p className="font-bold text-3xl text-gray-800">AI가 여행 일정을 만들고 있어요</p>
          <p className="text-display-3 text-gray-500">잠시만 기다려주세요, 완벽한 여행을 준비중이에요</p>
        </div>
      </section>

    </main>
  );
};

export default AiLoading;
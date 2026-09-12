import Image from "next/image";

type WorldBackgroundProps = {
  src?: string;
  className?: string;
};

export function WorldBackground({
  src = "/assets/backgrounds/landing-bg.png",
  className = "",
}: WorldBackgroundProps) {
  return (
    <div className={`ru-world-background ${className}`} aria-hidden="true">
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="ru-world-image"
      />

      <div className="ru-world-sky" />
      <div className="ru-world-vignette" />
      <div className="ru-world-grain" />
      <div className="ru-world-bloom" />
    </div>
  );
}

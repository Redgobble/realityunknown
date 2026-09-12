type XPBarProps = {
  current: number;
  nextLevel: number;
  level?: number;
};

export function XPBar({
  current,
  nextLevel,
  level = 1,
}: XPBarProps) {
  const progress = Math.min(
    100,
    Math.max(0, (current / nextLevel) * 100)
  );

  return (
    <div className="ru-xp">
      <div className="ru-xp-topline">
        <span>
          LV {String(level).padStart(2, "0")}
        </span>

        <span>
          {current} / {nextLevel} XP
        </span>
      </div>

      <div className="ru-xp-track">
        <div
          className="ru-xp-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

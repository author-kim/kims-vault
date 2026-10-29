import { Check, RotateCcw } from "lucide-react";
import type { CSSProperties } from "react";
import { useReaderSettings } from "@/app/reader-settings-context";
import { Button } from "@/components/ui/button";
import { readerFonts, type ReaderTheme } from "@/lib/reader-storage";
import "@/styles/reader.css";

const themes: { id: ReaderTheme; label: string; color: string }[] = [
  { id: "light", label: "밝게", color: "#ffffff" },
  { id: "paper", label: "종이색", color: "#f6f3ed" },
  { id: "gray", label: "어두운 회색", color: "#303234" },
  { id: "dark", label: "어둡게", color: "#1d201c" },
  { id: "forest", label: "짙은 녹색", color: "#0d211a" },
];

function SettingSlider({
  id,
  label,
  displayValue,
  min,
  max,
  step,
  value,
  onChange,
  valueText,
}: {
  id: string;
  label: string;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  valueText?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 flex justify-between gap-3 text-sm font-medium"
      >
        {label}{" "}
        <span className="text-muted-foreground tabular-nums">
          {displayValue}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
        className="reader-slider"
        style={
          {
            "--slider-progress": `${((value - min) / (max - min)) * 100}%`,
          } as CSSProperties
        }
      />
    </div>
  );
}

export default function ReadingSettings() {
  const { settings, fontStatus, updateSettings, resetSettings } =
    useReaderSettings();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="region"
        aria-label="본문 미리보기"
        tabIndex={0}
        className="max-h-[min(115px,35%)] shrink-0 overflow-y-auto overscroll-contain border-b px-6 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <p className="mb-2 text-xs text-muted-foreground">미리보기</p>
        <p className="reading-preview">
          <span className="reading-preview-line">김 작가가 문을 열었다.</span>
          <span className="reading-preview-line">
            "좋은 아침! 커피 드실 분?"
          </span>
        </p>
        <p
          role="status"
          aria-live="polite"
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {fontStatus === "loading"
            ? "글꼴을 불러오는 중…"
            : fontStatus === "error"
              ? "글꼴을 불러오지 못해 디바이스 기본으로 표시합니다."
              : ""}
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain p-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium">화면 테마</legend>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <label
                key={theme.id}
                className="relative flex min-h-12 cursor-pointer items-center justify-center rounded-md border has-checked:border-ring has-checked:ring-2 has-checked:ring-ring has-checked:ring-offset-2 has-checked:ring-offset-background has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ring"
                style={{ backgroundColor: theme.color }}
              >
                <input
                  type="radio"
                  name="reader-theme"
                  value={theme.id}
                  checked={settings.theme === theme.id}
                  onChange={() => updateSettings({ theme: theme.id })}
                  className="peer sr-only"
                />
                <span className="sr-only">{theme.label}</span>
                <span
                  aria-hidden="true"
                  className="hidden size-6 items-center justify-center rounded-full bg-primary text-primary-foreground peer-checked:flex"
                >
                  <Check className="size-4" />
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-medium">본문 글꼴</legend>
          <div className="space-y-1">
            {readerFonts.map((font) => (
              <div
                key={font.id}
                className="flex min-h-11 items-center gap-2 rounded-md text-sm has-checked:bg-accent"
              >
                <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center rounded-md px-3 py-2 has-focus-visible:ring-2 has-focus-visible:ring-ring">
                  <input
                    type="radio"
                    name="reader-font"
                    value={font.id}
                    checked={settings.font === font.id}
                    onChange={() => updateSettings({ font: font.id })}
                    className="sr-only"
                  />
                  <span
                    style={{
                      fontFamily: font.family,
                      fontWeight:
                        settings.font === font.id
                          ? settings.fontWeight
                          : font.defaultWeight,
                    }}
                  >
                    {font.label}
                  </span>
                </label>
                {settings.font === font.id && font.weights.length > 1 && (
                  <fieldset className="shrink-0 pr-2">
                    <legend className="sr-only">{font.label} 굵기</legend>
                    <div className="flex gap-1">
                      {font.weights.map(({ value: weight, label }) => (
                        <label
                          key={weight}
                          className="flex min-h-9 min-w-10 cursor-pointer items-center justify-center rounded px-2 text-xs text-muted-foreground has-checked:bg-background has-checked:text-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
                        >
                          <input
                            type="radio"
                            name="reader-font-weight"
                            value={weight}
                            checked={settings.fontWeight === weight}
                            onChange={() =>
                              updateSettings({ fontWeight: weight })
                            }
                            className="sr-only"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>
            ))}
          </div>
        </fieldset>
        <SettingSlider
          id="reader-font-size"
          label="글자 크기"
          displayValue={`${settings.fontSize}px`}
          min={16}
          max={26}
          step={1}
          value={settings.fontSize}
          valueText={`${settings.fontSize}픽셀`}
          onChange={(fontSize) => updateSettings({ fontSize })}
        />
        <SettingSlider
          id="reader-line-height"
          label="줄 간격"
          displayValue={settings.lineHeight.toFixed(1)}
          min={1.6}
          max={2.2}
          step={0.1}
          value={settings.lineHeight}
          onChange={(lineHeight) => updateSettings({ lineHeight })}
        />
        <SettingSlider
          id="reader-indent"
          label="첫 줄 들여쓰기"
          displayValue={`${settings.indent}단계`}
          min={0}
          max={2}
          step={1}
          value={settings.indent}
          valueText={`${settings.indent}단계, ${settings.indent === 0 ? "들여쓰기 없음" : `${settings.indent * 0.5}em`}`}
          onChange={(indent) => updateSettings({ indent: indent as 0 | 1 | 2 })}
        />
        <Button
          variant="outline"
          onClick={resetSettings}
          className="min-h-11 w-full"
        >
          <RotateCcw aria-hidden="true" /> 기본값으로
        </Button>
      </div>
    </div>
  );
}

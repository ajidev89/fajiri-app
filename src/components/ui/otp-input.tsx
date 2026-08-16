import React, { useRef, useEffect } from "react";

interface OtpInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
}

export function OtpInput({
    value = "",
    onChange,
    length = 6,
    disabled = false,
    autoFocus = true,
    className = "",
}: OtpInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const digits = Array.from({ length }, (_, i) => value[i] || "");

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0]?.focus();
        }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const inputVal = e.target.value.replace(/\D/g, "");
        if (!inputVal) {
            const newDigits = [...digits];
            newDigits[index] = "";
            onChange(newDigits.join("").trimEnd());
            return;
        }

        const char = inputVal.slice(-1);
        const newDigits = [...digits];
        newDigits[index] = char;
        const newValue = newDigits.join("");
        onChange(newValue);

        if (char && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!digits[index] && index > 0) {
                const newDigits = [...digits];
                newDigits[index - 1] = "";
                onChange(newDigits.join(""));
                inputRefs.current[index - 1]?.focus();
            } else {
                const newDigits = [...digits];
                newDigits[index] = "";
                onChange(newDigits.join(""));
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (pasted) {
            onChange(pasted);
            const nextIndex = Math.min(pasted.length, length - 1);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    return (
        <div className={`flex items-center justify-center gap-2 sm:gap-2.5 ${className}`}>
            {Array.from({ length }).map((_, index) => {
                const isFilled = Boolean(digits[index]);
                return (
                    <input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digits[index]}
                        disabled={disabled}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
                            isFilled
                                ? "border-[#002B49] bg-white text-slate-900 shadow-sm"
                                : "border-slate-200 bg-slate-50/70 text-slate-900 focus:border-[#002B49] focus:bg-white focus:ring-4 focus:ring-[#002B49]/10"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                );
            })}
        </div>
    );
}

export default OtpInput;

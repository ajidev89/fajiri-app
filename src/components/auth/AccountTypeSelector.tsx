import { Info, Check } from "lucide-react";
import { ACCOUNT_TYPES, type AccountTypeOption } from "@/constants/accountTypes";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AccountTypeSelectorProps {
    value: string;
    subValue?: string | null;
    onChange: (value: string) => void;
    onSubChange?: (subValue: string) => void;
    disabled?: boolean;
    className?: string;
}

export default function AccountTypeSelector({
    value,
    subValue,
    onChange,
    onSubChange,
    disabled = false,
    className,
}: AccountTypeSelectorProps) {
    const selectedMainType = ACCOUNT_TYPES.find((t) => t.id === value);
    const subTypes = selectedMainType?.subTypes || [];

    return (
        <TooltipProvider delayDuration={100}>
            <div className={cn("space-y-4", className)}>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-slate-700 font-semibold text-sm">
                            Account Type
                        </Label>
                        <span className="text-[11px] text-slate-400 font-medium">
                            Hover over any option for details
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {ACCOUNT_TYPES.map((type: AccountTypeOption) => {
                            const isSelected = value === type.id;

                            return (
                                <div
                                    key={type.id}
                                    className={cn(
                                        "group/item relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
                                        isSelected
                                            ? "border-[#002B49] bg-gradient-to-r from-blue-50/40 via-white to-white shadow-xs ring-1 ring-[#002B49]/10"
                                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50",
                                        disabled && "opacity-60 cursor-not-allowed"
                                    )}
                                    onClick={() => {
                                        if (disabled) return;
                                        onChange(type.id);
                                        // Auto-select first sub-type if switching to corporate
                                        if (type.subTypes && type.subTypes.length > 0 && onSubChange) {
                                            if (!subValue || !type.subTypes.some(st => st.id === subValue)) {
                                                onSubChange(type.subTypes[0].id);
                                            }
                                        }
                                    }}
                                >
                                    <div className="p-3.5 flex items-start gap-3">
                                        {/* Bullet radio button with hover tooltip */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    disabled={disabled}
                                                    aria-label={`Select ${type.name}`}
                                                    className="mt-0.5 shrink-0 focus:outline-hidden"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (disabled) return;
                                                        onChange(type.id);
                                                        if (type.subTypes && type.subTypes.length > 0 && onSubChange) {
                                                            if (!subValue || !type.subTypes.some(st => st.id === subValue)) {
                                                                onSubChange(type.subTypes[0].id);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <div
                                                        className={cn(
                                                            "w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150",
                                                            isSelected
                                                                ? "border-[#002B49] bg-[#002B49] text-white shadow-xs"
                                                                : "border-slate-300 bg-white group-hover/item:border-slate-400"
                                                        )}
                                                    >
                                                        {isSelected ? (
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover/item:bg-slate-200" />
                                                        )}
                                                    </div>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" align="start">
                                                <p className="font-semibold text-slate-100 mb-1">
                                                    {type.labelNumber ? `${type.labelNumber}. ` : ""}{type.name}
                                                </p>
                                                <p className="text-slate-300 font-normal">{type.description}</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        {/* Account Type Title with hover tooltip */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span
                                                            className={cn(
                                                                "font-semibold text-sm transition-colors cursor-pointer select-none inline-flex items-center gap-1.5",
                                                                isSelected
                                                                    ? "text-[#002B49]"
                                                                    : "text-slate-800 group-hover/item:text-slate-900"
                                                            )}
                                                        >
                                                            <span>
                                                                {type.labelNumber ? `${type.labelNumber}. ` : ""}
                                                                {type.name}
                                                            </span>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" align="start">
                                                        <p className="font-semibold text-slate-100 mb-1">
                                                            {type.labelNumber ? `${type.labelNumber}. ` : ""}{type.name}
                                                        </p>
                                                        <p className="text-slate-300 font-normal">{type.description}</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                {/* Info badge button triggering tooltip */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-1 text-slate-400 hover:text-[#002B49] hover:bg-slate-100 rounded-full transition-colors shrink-0"
                                                            aria-label={`About ${type.name}`}
                                                        >
                                                            <Info className="w-3.5 h-3.5" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" align="end">
                                                        <p className="font-semibold text-slate-100 mb-1">
                                                            {type.labelNumber ? `${type.labelNumber}. ` : ""}{type.name}
                                                        </p>
                                                        <p className="text-slate-300 font-normal">{type.description}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>

                                            {/* Helper description displayed under selected card */}
                                            {isSelected && (
                                                <p className="text-xs text-slate-600 font-normal mt-1.5 leading-relaxed bg-white/80 p-2 rounded-lg border border-blue-100/60 animate-in fade-in-50 duration-150">
                                                    {type.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sub Account Type Section for Corporate Membership */}
                {value === "corporate-membership" && subTypes.length > 0 && (
                    <div className="pl-3.5 border-l-2 border-[#002B49]/30 ml-2.5 space-y-2 pt-1 animate-in fade-in-50 duration-200">
                        <div className="flex items-center justify-between mb-1">
                            <Label className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                                Corporate Sub-Account Type
                            </Label>
                            <span className="text-[10px] text-slate-400 font-medium">
                                Select corporate focus
                            </span>
                        </div>

                        <div className="space-y-2">
                            {subTypes.map((sub: AccountTypeOption) => {
                                const isSubSelected = subValue === sub.id;

                                return (
                                    <div
                                        key={sub.id}
                                        className={cn(
                                            "group/sub relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
                                            isSubSelected
                                                ? "border-[#002B49] bg-gradient-to-r from-blue-50/60 via-white to-white shadow-xs ring-1 ring-[#002B49]/10"
                                                : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50",
                                            disabled && "opacity-60 cursor-not-allowed"
                                        )}
                                        onClick={() => {
                                            if (disabled || !onSubChange) return;
                                            onSubChange(sub.id);
                                        }}
                                    >
                                        <div className="p-3 flex items-start gap-2.5">
                                            {/* Sub bullet with tooltip */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        disabled={disabled}
                                                        aria-label={`Select ${sub.name}`}
                                                        className="mt-0.5 shrink-0 focus:outline-hidden"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (disabled || !onSubChange) return;
                                                            onSubChange(sub.id);
                                                        }}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-150",
                                                                isSubSelected
                                                                    ? "border-[#002B49] bg-[#002B49] text-white"
                                                                    : "border-slate-300 bg-white group-hover/sub:border-slate-400"
                                                            )}
                                                        >
                                                            {isSubSelected && (
                                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                            )}
                                                        </div>
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" align="start">
                                                    <p className="font-semibold text-slate-100 mb-1">
                                                        {sub.labelNumber ? `${sub.labelNumber}. ` : ""}{sub.name}
                                                    </p>
                                                    <p className="text-slate-300 font-normal">{sub.description}</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            {/* Sub Name with tooltip */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span
                                                                className={cn(
                                                                    "font-medium text-xs sm:text-sm cursor-pointer select-none inline-flex items-center gap-1",
                                                                    isSubSelected
                                                                        ? "text-[#002B49] font-semibold"
                                                                        : "text-slate-700 group-hover/sub:text-slate-900"
                                                                )}
                                                            >
                                                                <span>
                                                                    {sub.labelNumber ? `${sub.labelNumber}. ` : ""}
                                                                    {sub.name}
                                                                </span>
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" align="start">
                                                            <p className="font-semibold text-slate-100 mb-1">
                                                                {sub.labelNumber ? `${sub.labelNumber}. ` : ""}{sub.name}
                                                            </p>
                                                            <p className="text-slate-300 font-normal">{sub.description}</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="p-1 text-slate-400 hover:text-[#002B49] hover:bg-slate-100 rounded-full transition-colors shrink-0"
                                                                aria-label={`About ${sub.name}`}
                                                            >
                                                                <Info className="w-3 h-3" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" align="end">
                                                            <p className="font-semibold text-slate-100 mb-1">
                                                                {sub.labelNumber ? `${sub.labelNumber}. ` : ""}{sub.name}
                                                            </p>
                                                            <p className="text-slate-300 font-normal">{sub.description}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>

                                                {/* Sub description when selected */}
                                                {isSubSelected && (
                                                    <p className="text-[11px] text-slate-600 font-normal mt-1 leading-relaxed bg-white/90 p-2 rounded-lg border border-blue-100/60 animate-in fade-in-50 duration-150">
                                                        {sub.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

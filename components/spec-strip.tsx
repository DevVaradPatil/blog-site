import { cn } from "@/lib/utils";

export type Spec = {
    label: string;
    value: React.ReactNode;
};

type SpecStripProps = {
    specs: Spec[];
    className?: string;
};

/**
 * Post metadata as a compact stat row.
 *
 * This previously used dotted leader lines borrowed from a printed table of
 * contents, which was the single most book-like element in the interface.
 * Same information, product surface instead of page furniture.
 */
const SpecStrip = ({ specs, className }: SpecStripProps) => (
    <dl
        className={cn(
            "grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-10",
            className,
        )}
    >
        {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-1">
                <dt className="label">{spec.label}</dt>
                <dd className="text-sm font-medium text-foreground">{spec.value}</dd>
            </div>
        ))}
    </dl>
);

export default SpecStrip;

import Image from "next/image";

/** Compact line item for order summaries: thumbnail with qty badge, name, price. */
export function SummaryLineItem({
  thumbnail,
  title,
  variantTitle,
  quantity,
  price,
}: {
  thumbnail: string | null;
  title: string;
  variantTitle?: string | null;
  quantity: number;
  price: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="relative shrink-0">
        <div className="relative w-14 h-14 border-[3px] border-black bg-white overflow-hidden">
          {thumbnail && (
            <Image src={thumbnail} alt="" fill sizes="56px" className="object-cover" />
          )}
        </div>
        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 inline-flex items-center justify-center bg-hotpink border-[2px] border-black text-[10px] font-black leading-none">
          {quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{title}</p>
        {variantTitle && (
          <p className="text-xs font-medium text-muted truncate">{variantTitle}</p>
        )}
      </div>
      <span className="font-black whitespace-nowrap">{price}</span>
    </div>
  );
}

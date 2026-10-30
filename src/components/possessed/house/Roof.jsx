export default function Roof() {
  return (
    <div className="relative h-10 w-full sm:h-14 md:h-20" aria-hidden="true">
      <div className="absolute bottom-0 right-[18%] h-[90%] w-[6%] min-w-4 bg-[#2b1d3a] shadow-[inset_0_6px_0_#1b1226]" />
      <div className="shingles absolute inset-0" style={{ clipPath: 'polygon(2% 100%, 50% 0%, 98% 100%)' }} />
      <div className="absolute bottom-[18%] left-1/2 h-[42%] aspect-square -translate-x-1/2 rounded-full border-[3px] border-[#5A3324] bg-pumpkin/80 shadow-[0_0_24px_rgba(255,173,66,.6)]">
        <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#5A3324]" />
        <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-[#5A3324]" />
      </div>
    </div>
  );
}
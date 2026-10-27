export function ArtEmpty() {
  return (
    <div className="bg-cream border-[4px] border-black shadow-[6px_6px_0_0_#fff] p-8 md:p-12 text-center max-w-xl mx-auto">
      <p className="text-brutal text-2xl md:text-3xl text-black">
        NOTHING IN THE GALLERY YET.
      </p>
      <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted mt-3">
        Add pieces from the admin → Art panel.
      </p>
    </div>
  );
}

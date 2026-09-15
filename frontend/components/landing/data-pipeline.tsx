const stages = ["Mundo físico", "Captura", "OEST", "GIS / BIM / ERP / AI"];
const formats = ["GeoTIFF", "LAS / LAZ", "DXF / DWG", "OBJ / 3D Tiles", "PDF técnico", "GeoJSON"];

export function DataPipeline() {
  return (
    <section id="integracoes" className="bg-oest-ice/24 py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-oest-blue">Integração</p>
            <h2 className="mt-5 text-[40px] font-bold leading-[0.98] tracking-[-0.045em] text-oest-ink sm:text-[52px]">Do mundo físico ao sistema que move a sua operação.</h2>
            <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-oest-ink/65">Defina o formato esperado desde o início da missão e mantenha os dados em uma linguagem útil para engenharia, geoespacial e automação.</p>
          </div>
          <div className="lg:col-span-7">
            <ol className="grid grid-cols-2 gap-px bg-oest-ink/15 sm:grid-cols-4">
              {stages.map((stage, index) => <li className={`min-h-[128px] p-5 ${index === 2 ? "bg-oest-blue text-white" : "bg-white text-oest-ink"}`} key={stage}><p className={`text-[10px] font-semibold tracking-[0.14em] ${index === 2 ? "text-oest-yellow" : "text-oest-blue"}`}>0{index + 1}</p><p className="mt-9 text-[17px] font-bold leading-tight tracking-[-0.02em]">{stage}</p></li>)}
            </ol>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-oest-ink/15 pt-5">
          {formats.map((format) => <span className="text-[12px] font-medium text-oest-ink/70" key={format}>{format}</span>)}
        </div>
      </div>
    </section>
  );
}

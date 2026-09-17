export default function Header({ titulo, subtitulo }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
        <p className="text-xs text-gray-500">{subtitulo}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
          📅 Hoy, 16 de septiembre de 2025
        </span>
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="bg-blue-600 text-white font-bold w-9 h-9 rounded-full flex items-center justify-center">
            AT
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Ana Torres</p>
            <p className="text-[11px] text-gray-500">Recepción</p>
          </div>
        </div>
      </div>
    </header>
  );
}
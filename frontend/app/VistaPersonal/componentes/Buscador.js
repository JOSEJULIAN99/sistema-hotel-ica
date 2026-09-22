export default function Buscador({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="relative w-full md:w-80">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
        🔍
      </span>
      <input 
        type="text" 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
      />
    </div>
  );
}
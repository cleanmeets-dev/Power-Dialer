export default function FormSelect({ label, name, options, value, onChange, error, required = false, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 rounded-lg bg-slate-700 text-white border transition focus:outline-none ${
          error 
            ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400' 
            : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
        } focus:ring-1`}
        {...props}
      >
        <option value="">Select {label?.toLowerCase()}</option>
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-rose-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

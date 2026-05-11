import { Search } from "lucide-react";

const SearchBar = ({ onSearch, value }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
        placeholder="Search by customer or order ID..."
        onChange={(e) => onSearch(e.target.value)} // get the input value
      />
    </div>
  );
};

export default SearchBar;

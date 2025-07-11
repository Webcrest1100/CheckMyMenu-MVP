export default function SearchBar({ search, onSearchChange }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search menu items..."
        value={search}
        onChange={onSearchChange}
      />
    </div>
  );
}

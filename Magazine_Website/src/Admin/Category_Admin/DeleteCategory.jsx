import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../../context/ToastContext";

// Mock categories
const mockCategories = [
  { name: "Bollywood", slug: "bollywood", design: "design1" },
  { name: "Technology", slug: "technology", design: "design2" },
  { name: "Fashion", slug: "fashion", design: "design3" },
];

const DeleteCategory = () => {
  const [categories, setCategories] = useState(mockCategories);
  const [selected, setSelected] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showSuccess } = useToast();

  const cardBg = isDark
    ? "bg-black border border-white/10"
    : "bg-white border border-black/10";
  const textMain = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-gray-300" : "text-gray-600";
  const btnDanger = isDark
    ? "bg-white text-black hover:bg-gray-200"
    : "bg-black text-white hover:bg-gray-900";
  const selectTheme = isDark
    ? "bg-black text-white border-white/20"
    : "bg-white text-black border-black/20";
  const listText = isDark ? "text-gray-200" : "text-gray-700";
  const innerCardBg = isDark ? "bg-gray-800/50" : "bg-gray-50";
  const innerBorderColor = isDark ? "border-white/10" : "border-gray-200";

  const handleDelete = (e) => {
    e.preventDefault();
    if (!selected) return;
    setCategories(categories.filter((cat) => cat.slug !== selected));
    setSelected("");
    showSuccess("Category deleted successfully!");
  };

  const getDesignInfo = (design) => {
    const designMap = {
      design1: { name: "Design 1", icon: "⊞", color: "bg-blue-500" },
      design2: { name: "Design 2", icon: "☰", color: "bg-green-500" },
      design3: { name: "Design 3", icon: "▤", color: "bg-purple-500" }
    };
    return designMap[design] || { name: "Unknown", icon: "?", color: "bg-gray-500" };
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-white"} py-12 px-2 flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-4xl ${cardBg} rounded-2xl p-8 md:p-12`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 ${textMain}`}>
              Delete Category
            </h2>
            <p className={`text-base ${subText}`}>
              Select a category to permanently remove it from your magazine.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-block ${isDark ? "bg-white text-black" : "bg-black text-white"} px-4 py-2 rounded-lg font-semibold`}>
              <svg className="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M4 7h16" />
              </svg>
              Danger Zone
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delete Form */}
          <div className={`${innerCardBg} rounded-xl p-6 space-y-6 border ${innerBorderColor}`}>
            <h3 className={`text-lg font-semibold ${textMain}`}>Delete Category</h3>
            <form onSubmit={handleDelete} className="space-y-6">
              <div>
                <label className={`block font-semibold mb-2 ${textMain}`}>Select Category to Delete</label>
                <select
                  className={`w-full rounded px-3 py-2 border focus:outline-none transition ${selectTheme}`}
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name} ({getDesignInfo(cat.design).name})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-bold transition ${btnDanger}`}
                disabled={!selected}
              >
                Delete Category
              </button>
            </form>
          </div>

          {/* Design Preview */}
          <div className={`${innerCardBg} rounded-xl p-6 border ${innerBorderColor}`}>
            <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>Design Information</h3>
            <div className="space-y-4">
              {categories.map((cat) => {
                const designInfo = getDesignInfo(cat.design);
                return (
                  <div key={cat.slug} className={`p-4 rounded-lg border ${innerBorderColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${textMain}`}>{cat.name}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${designInfo.color}`}>
                        {designInfo.icon} {designInfo.name}
                      </span>
                    </div>
                    <p className={`text-sm ${subText}`}>
                      This category uses {designInfo.name} layout
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className={`text-lg font-semibold mb-2 ${textMain}`}>Current Categories:</h3>
          <ul className={`list-disc list-inside ${listText}`}>
            {categories.length === 0 ? (
              <li className="text-gray-400">No categories left.</li>
            ) : (
              categories.map((cat) => {
                const designInfo = getDesignInfo(cat.design);
                return (
                  <li key={cat.slug}>
                    {cat.name} - {designInfo.name}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategory;
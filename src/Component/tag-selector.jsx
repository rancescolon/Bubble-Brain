"use client"

import {useState, useEffect} from "react"
import { X } from "lucide-react"
import text from "../text.json"

const TagSelector = ({
                         selectedCategories,
                         setSelectedCategories,
                         selectedTags,
                         setSelectedTags,
                         school_categories,
                         isMobile = false,
                         maxCategories = 3,
                         onCancel,
                         onSave,
                         saveButtonText = "Save Template",
                         embedded = false,
                         language = "English"
                     }) => {
    const [availableTags, setAvailableTags] = useState([])
    const [showTagsSection, setShowTagsSection] = useState(false)

    const langKey = language === "English" ? "en" : "es"
    const tagViewText = text[langKey].tagSelector
    const categoriesText = text[langKey].categories

    // Helper function to translate category names
    const translateCategory = (category) => {
        return categoriesText[category] || category
    }

    // Update available tags whenever selected categories change
    useEffect(() => {
        let tags = []
        selectedCategories.forEach((category) => {
            if (school_categories[category]) {
                tags = [...tags, ...school_categories[category]]
            }
        })
        // Remove duplicates
        setAvailableTags([...new Set(tags)])

        // Show tags section if categories are selected
        setShowTagsSection(selectedCategories.length > 0)
    }, [selectedCategories, school_categories])

    const handleCategorySelection = (category) => {
        if (selectedCategories.includes(category)) {
            // Remove category
            setSelectedCategories(selectedCategories.filter((c) => c !== category))
            // Remove any tags that were only in this category
            const remainingCategoriesTags = selectedCategories
                .filter((c) => c !== category)
                .flatMap((c) => school_categories[c] || [])
            setSelectedTags(selectedTags.filter((tag) => remainingCategoriesTags.includes(tag)))
        } else if (selectedCategories.length < maxCategories) {
            // Add category
            setSelectedCategories([...selectedCategories, category])
        }
    }

    const handleTagSelection = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((t) => t !== tag))
        } else if (selectedTags.length < 5) {
            setSelectedTags([...selectedTags, tag])
        }
    }

    // If embedded, render a simplified version
    if (embedded) {
        return (
            <div className="p-2">
                {/* Categories Selection */}
                <div className="mb-4">
                    <h3 className={`text-[${isMobile ? "14px" : "16px"}] font-semibold mb-2 text-[#1D1D20]`}>
                        {tagViewText.embedded.headerCategories}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(school_categories).map((category) => (
                            <button
                                key={category}
                                className={`px-3 py-1 rounded-xl text-[${isMobile ? "12px" : "14px"}] ${
                                    selectedCategories.includes(category) ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF] text-[#1D1D20]"
                                } ${selectedCategories.length >= maxCategories && !selectedCategories.includes(category) ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => handleCategorySelection(category)}
                                disabled={selectedCategories.length >= maxCategories && !selectedCategories.includes(category)}
                            >
                                {translateCategory(category)}
                            </button>
                        ))}
                    </div>
                    <p className="mt-1 text-[12px] text-[#1D1D20]/70">
                        {selectedCategories.length}/{maxCategories} {tagViewText.embedded.categoriesSelected}
                    </p>
                </div>

                {/* Tags Selection */}
                {showTagsSection && (
                    <div>
                        <h3 className={`text-[${isMobile ? "14px" : "16px"}] font-semibold mb-2 text-[#1D1D20]`}>
                            {tagViewText.embedded.headerTags}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    className={`px-3 py-1 rounded-xl text-[${isMobile ? "12px" : "14px"}] ${
                                        selectedTags.includes(tag) ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF] text-[#1D1D20]"
                                    } ${selectedTags.length >= 5 && !selectedTags.includes(tag) ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => handleTagSelection(tag)}
                                    disabled={selectedTags.length >= 5 && !selectedTags.includes(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <p className="mt-1 text-[12px] text-[#1D1D20]/70">
                            {selectedTags.length}/5 {tagViewText.embedded.tagsSelected}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl p-4 md:p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#1D1D20]">{tagViewText.full.title}</h2>
                {onCancel && (
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                )}
            </div>

            <p className="text-gray-600 text-sm mb-6">
                {tagViewText.full.description}
            </p>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[16px] font-semibold text-[#1D1D20]">{tagViewText.full.title}</h3>
                    <p className="text-[14px] text-[#1D1D20]/70">{tagViewText.full.helpText}</p>
                </div>

                <div className="mb-4">
                    <label className="block text-[#1D1D20] mb-2 text-[16px]">
                        {tagViewText.full.labelSelectCategories.replace("{{maxCategories}}", maxCategories)}
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border border-[#E9D0CE] rounded-xl mb-2">
                        {Object.keys(school_categories).map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategorySelection(category)}
                                className={`px-3 py-1.5 rounded-lg text-[14px] ${
                                    selectedCategories.includes(category)
                                        ? "bg-[#1D6EF1] text-white"
                                        : "bg-[#F4FDFF] text-[#1D1D20] border border-[#E9D0CE]"
                                } ${selectedCategories.length >= maxCategories && !selectedCategories.includes(category) ? "opacity-50 cursor-not-allowed" : ""}`}
                                disabled={selectedCategories.length >= maxCategories && !selectedCategories.includes(category)}
                            >
                                {translateCategory(category)}
                            </button>
                        ))}
                    </div>
                    <p className="text-[12px] text-[#1D1D20]/70">
                        {tagViewText.full.selectedCategories.replace("{{selectedCategories.length}}", selectedCategories.length).replace("{{maxCategories}}", maxCategories)}
                    </p>
                </div>

                {showTagsSection && (
                    <div>
                        <label className="block text-[#1D1D20] mb-2 text-[16px]">{tagViewText.full.labelSelectTags}</label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-[#E9D0CE] rounded-xl">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagSelection(tag)}
                                    className={`px-3 py-1.5 rounded-lg text-[14px] ${
                                        selectedTags.includes(tag)
                                            ? "bg-[#1D6EF1] text-white"
                                            : "bg-[#F4FDFF] text-[#1D1D20] border border-[#E9D0CE]"
                                    } ${selectedTags.length >= 5 && !selectedTags.includes(tag) ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={selectedTags.length >= 5 && !selectedTags.includes(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-[12px] text-[#1D1D20]/70">
                            {tagViewText.full.selectedTags.replace("{{selectedTags.length}}", selectedTags.length)}
                        </p>
                    </div>
                )}
            </div>

            {(onCancel || onSave) && (
                <div className="flex justify-between mt-6">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            {tagViewText.full.buttonCancel}
                        </button>
                    )}
                    {onSave && (
                        <button
                            onClick={onSave}
                            className="px-4 py-2 bg-[#1D6EF1] text-white rounded-lg hover:bg-[#1557B0] flex items-center"
                        >
                            {tagViewText.full.buttonSave.replace("{{saveButtonText}}", saveButtonText)}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default TagSelector


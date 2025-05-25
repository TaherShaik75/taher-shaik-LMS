/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export function renderSearchBar(searchParams = new URLSearchParams()) {
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || ''; 
    const price = searchParams.get('price') || ''; 

    const categories = [
        { value: "", display: "All Categories" },
        { value: "Programming", display: "Programming" },
        { value: "Design", display: "Design" },
        { value: "Business", display: "Business" },
        { value: "Data Science", display: "Data Science" },
        { value: "Marketing", display: "Marketing" },
        { value: "Personal Development", display: "Personal Development" },
        { value: "Other", display: "Other" }
    ];

    const priceOptions = [
        { value: "", display: "All Prices" },
        { value: "free", display: "Free" },
        { value: "paid", display: "Paid" }
    ];

    return `
        <section class="search-bar-section" aria-label="Course Search and Filters">
            <form id="search-form" role="search">
                <div class="search-bar-container">
                    <label for="search-input" class="sr-only">Search for courses</label>
                    <input type="search" id="search-input" name="query" placeholder="Search by keyword, title, instructor..." aria-label="Search for courses" value="${query}">
                    <button type="submit" class="button-like primary">Search</button>
                </div>
                <div class="filter-options" style="margin-top: 10px; display: flex; gap: 15px; align-items: center; flex-wrap:wrap;">
                    <div>
                        <label for="filter-category" style="margin-right: 5px;">Category:</label>
                        <select id="filter-category" name="category" aria-label="Filter by category">
                            ${categories.map(cat => 
                                `<option value="${cat.value}" ${category === cat.value ? 'selected' : ''}>${cat.display}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="filter-price" style="margin-right: 5px;">Price:</label>
                        <select id="filter-price" name="price" aria-label="Filter by price">
                             ${priceOptions.map(opt => 
                                `<option value="${opt.value}" ${price === opt.value ? 'selected' : ''}>${opt.display}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <button type="submit" class="button-like secondary" style="padding: 0.6rem 1rem;">Apply Filters</button> 
                </div>
            </form>
        </section>
    `;
}
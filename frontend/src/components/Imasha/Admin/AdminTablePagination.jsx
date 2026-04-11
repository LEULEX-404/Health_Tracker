const MAX_VISIBLE_PAGES = 5;

function getVisiblePages(currentPage, totalPages) {
    if (totalPages <= MAX_VISIBLE_PAGES) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(MAX_VISIBLE_PAGES / 2);
    let start = Math.max(1, currentPage - half);
    let end = start + MAX_VISIBLE_PAGES - 1;

    if (end > totalPages) {
        end = totalPages;
        start = end - MAX_VISIBLE_PAGES + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function AdminTablePagination({
    currentPage,
    totalItems,
    itemsPerPage = 10,
    onPageChange,
    itemLabel = 'items',
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const visiblePages = getVisiblePages(currentPage, totalPages);
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);

    if (totalItems <= itemsPerPage) {
        return (
            <div className="admin-pagination">
                <p className="admin-pagination__summary">
                    Showing {startItem}-{endItem} of {totalItems} {itemLabel}
                </p>
            </div>
        );
    }

    return (
        <div className="admin-pagination">
            <p className="admin-pagination__summary">
                Showing {startItem}-{endItem} of {totalItems} {itemLabel}
            </p>

            <div className="admin-pagination__controls">
                <button
                    type="button"
                    className="admin-pagination__btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                <div className="admin-pagination__pages">
                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            type="button"
                            className={`admin-pagination__btn admin-pagination__page ${page === currentPage ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="admin-pagination__btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
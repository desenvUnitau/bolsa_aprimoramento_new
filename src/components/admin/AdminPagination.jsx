import Pagination from "react-bootstrap/Pagination";

function getVisiblePages(currentPage, totalPages) {
    const pages = [];
    const startPage = Math.max(currentPage - 1, 0);
    const endPage = Math.min(currentPage + 1, totalPages - 1);

    for (let page = startPage; page <= endPage; page += 1) {
        pages.push(page);
    }

    return pages;
}

export default function AdminPagination({ currentPage, totalPages, disabled, onPageChange }) {
    if (totalPages <= 1) {
        return null;
    }

    const visiblePages = getVisiblePages(currentPage, totalPages);

    return (
        <Pagination className="admin-pagination mb-0">
            <Pagination.First
                disabled={disabled || currentPage === 0}
                onClick={() => onPageChange(0)}
            />
            <Pagination.Prev
                disabled={disabled || currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
            />

            {visiblePages[0] > 0 ? <Pagination.Ellipsis disabled /> : null}

            {visiblePages.map((page) => (
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    disabled={disabled}
                    onClick={() => onPageChange(page)}
                >
                    {page + 1}
                </Pagination.Item>
            ))}

            {visiblePages[visiblePages.length - 1] < totalPages - 1 ? <Pagination.Ellipsis disabled /> : null}

            <Pagination.Next
                disabled={disabled || currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
            />
            <Pagination.Last
                disabled={disabled || currentPage >= totalPages - 1}
                onClick={() => onPageChange(totalPages - 1)}
            />
        </Pagination>
    );
}
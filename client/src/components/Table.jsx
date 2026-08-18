import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const Table = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records matching the current selection.',
  pagination = null, // { page, pages, total, onPageChange }
  sort = null, // { sortBy, sortOrder, onSort }
}) => {
  const handleSort = (columnAccessor) => {
    if (!sort || !columnAccessor) return;
    const isAsc = sort.sortBy === columnAccessor && sort.sortOrder === 'asc';
    sort.onSort(columnAccessor, isAsc ? 'desc' : 'asc');
  };

  return (
    <div className="table-wrapper">
      <div className="table-scroll-container">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const isSortable = sort && col.accessor && col.sortable !== false;
                const isCurrentSort = sort && sort.sortBy === col.accessor;

                return (
                  <th
                    key={col.header || idx}
                    style={{ width: col.width || 'auto', cursor: isSortable ? 'pointer' : 'default' }}
                    onClick={() => isSortable && handleSort(col.accessor)}
                    className={isSortable ? 'sortable-header' : ''}
                  >
                    <div className="th-content">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="sort-icons">
                          {isCurrentSort ? (
                            sort.sortOrder === 'asc' ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          ) : (
                            <ChevronDown size={14} className="sort-icon-placeholder" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading row skeleton
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`loader-${rIdx}`}>
                  {columns.map((_, cIdx) => (
                    <td key={`loader-cell-${cIdx}`}>
                      <div className="skeleton skeleton-text"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length} className="table-empty-state">
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              // Table data
              data.map((row, rIdx) => (
                <tr key={row._id || row.id || rIdx}>
                  {columns.map((col, cIdx) => {
                    let cellVal = '';
                    if (typeof col.accessor === 'function') {
                      cellVal = col.accessor(row);
                    } else if (col.accessor) {
                      // Support nested paths like 'department.name'
                      cellVal = col.accessor.split('.').reduce((o, i) => (o ? o[i] : ''), row);
                    }

                    return (
                      <td key={`${col.header || cIdx}`} className={col.className || ''}>
                        {col.render ? col.render(row, cellVal) : cellVal}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} records total)
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-pagination"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            
            {Array.from({ length: pagination.pages }).map((_, idx) => {
              const pageNum = idx + 1;
              // Only display page links close to the current page to avoid clutter
              if (
                pageNum === 1 ||
                pageNum === pagination.pages ||
                Math.abs(pageNum - pagination.page) <= 1
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`btn-page-number ${pagination.page === pageNum ? 'btn-page-active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (
                pageNum === 2 ||
                pageNum === pagination.pages - 1
              ) {
                return <span key={pageNum} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn-pagination"
              aria-label="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;

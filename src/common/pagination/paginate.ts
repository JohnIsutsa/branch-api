import { BASE_URL } from '../constants';
import { PaginatorInfo } from '../dto/paginator-info.dto';

export function paginate(
    totalItems: number,
    current_page = 1,
    pageSize = 10,
    count = 0,
    // maxPages = 10,
    url = '',
): PaginatorInfo {
    // calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (current_page < 1) {
        current_page = 1;
    } else if (current_page > totalPages) {
        current_page = totalPages;
    }

    // calculate start and end item indexes
    const startIndex = (current_page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // return object with all pager properties required by the view
    return {
        total: totalItems,
        current_page: +current_page,
        count,
        last_page: totalPages,
        firstItem: startIndex,
        lastItem: endIndex,
        per_page: pageSize,
        first_page_url: `${BASE_URL}${url}&page=1`,
        last_page_url: `${BASE_URL}${url}&page=${totalPages}`,
        next_page_url:
            totalPages > current_page
                ? `${BASE_URL}${url}&page=${Number(current_page) + 1}`
                : null,
        prev_page_url:
            current_page > 1
                ? `${BASE_URL}${url}&page=${Number(current_page) - 1}`
                : null,
    };
}

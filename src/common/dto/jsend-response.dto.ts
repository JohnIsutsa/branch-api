import { Paginator } from "./paginator.dto";

export class JsendResponse<T> {
    status: 'success' | 'fail' | 'error';
    data?: { [key: string]: T | T[] | string; };
    message?: string;
};

export class PaginatedJsendResponse<T> extends JsendResponse<Paginator<T>> {
    data?: { [key: string]: Paginator<T> | string };
    message?: string;
    status: "success" | "fail" | "error";
}
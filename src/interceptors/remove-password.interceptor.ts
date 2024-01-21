import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map } from "rxjs";

@Injectable()
export class RemovePasswordInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map((data) => {
                if(data && typeof data == 'object'){
                    this.removePasswordField(data);
                }
                return data
            })
        )
    }

    private removePasswordField(obj: any): void {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object') {
                    this.removePasswordField(obj[key]);
                } else if (key === 'password') {
                    delete obj[key];
                }
            }
        }
    }
}
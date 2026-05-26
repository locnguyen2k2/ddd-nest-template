import { Injectable } from "@nestjs/common";
import { IRequestPort } from "../../application/ports/http.port";

@Injectable()
export class RequestAdapter implements IRequestPort {
    async baseFetch<T>(url: string, options: RequestInit): Promise<T> {
        return fetch(url, options).then(res => res.json());
    }

    get<T>(url: string): Promise<T> {
        return this.baseFetch<T>(url, {
            method: 'GET',
        });
    }
    
    post<T>(url: string, data: any): Promise<T> {
        return this.baseFetch<T>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }
    
    put<T>(url: string, data: any): Promise<T> {
        return this.baseFetch<T>(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }
    
    delete<T>(url: string): Promise<T> {
        return this.baseFetch<T>(url, {
            method: 'DELETE',
        });
    }
}
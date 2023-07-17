export declare class Product {
    id: number;
    title: string;
    price: number;
    constructor(id: number, title: string, price: number);
}
export declare class ProductsService {
    products: Product[];
    getProducts(): Product[];
    insertProduct(title: string, price: number): void;
    deleteProduct(id: number): void;
}

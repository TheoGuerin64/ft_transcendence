import { ProductsService, Product } from './products.service';
export declare class ProductsController {
    private readonly ProductsService;
    constructor(ProductsService: ProductsService);
    getProducts(): Product[];
    insertProduct(title: string, price: number): void;
    deleteProduct(id: string): void;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class Product {
  constructor(
    public id: number,
    public title: string,
    public price: number
  ){}
}
export class ProductsService {

  products: Product[] = [];

  getProducts() : Product[]{
    return (this.products);
  }

  insertProduct(title: string, price: number) {
    this.products.push(new Product(Math.random(), title, price));
    //way of creating id not perfect
  }

  deleteProduct(id: number) {
    const index: number = this.products.findIndex(product => product.id === id);
    this.products.splice(index, 1);
  }
}

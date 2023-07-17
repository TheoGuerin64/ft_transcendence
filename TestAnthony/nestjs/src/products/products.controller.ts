import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ProductsService, Product } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly ProductsService: ProductsService) {}

  @Get()
  getProducts(): Product[] {
    return this.ProductsService.getProducts();
  }

  @Post()
  insertProduct(
    @Body('title') title : string,
    @Body('price') price : number, ) {
    this.ProductsService.insertProduct(title, price);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    this.ProductsService.deleteProduct(Number(id));
  }
}

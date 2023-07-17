"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = exports.Product = void 0;
const common_1 = require("@nestjs/common");
let Product = exports.Product = class Product {
    constructor(id, title, price) {
        this.id = id;
        this.title = title;
        this.price = price;
    }
};
exports.Product = Product = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Number, String, Number])
], Product);
class ProductsService {
    constructor() {
        this.products = [];
    }
    getProducts() {
        return (this.products);
    }
    insertProduct(title, price) {
        this.products.push(new Product(Math.random(), title, price));
    }
    deleteProduct(id) {
        const index = this.products.findIndex(product => product.id === id);
        this.products.splice(index, 1);
    }
}
exports.ProductsService = ProductsService;
//# sourceMappingURL=products.service.js.map
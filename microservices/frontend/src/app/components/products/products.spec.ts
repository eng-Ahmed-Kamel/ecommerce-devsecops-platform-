import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { IProduct } from '../../models/iproduct';
import { NgClass } from '@angular/common';
import { CalcPipe } from '../../pipes/calc-pipe-pipe';


@Component({
  selector: 'app-products',
  imports: [NgClass, CalcPipe],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class Products implements OnChanges, OnInit {

  @Input() recievedID: number = 0;
  @Output() total = new EventEmitter<number>();

  prdList: IProduct[];
  filteratedList: IProduct[] = [];
  totalPrice: number = 0;

  constructor() {
    this.prdList = [
    // Dresses & Gowns
    {
      id: 1,
      name: 'Silk Midnight Gown',
      price: 4500,
      quantity: 3,
      imgUrl: 'assets/images/img1.jpg',
      categoryId: 1,
      description: 'Flowing silk with gold trim',
      isNew: true,
    },
    {
      id: 2,
      name: 'Rose Petal Dress',
      price: 3200,
      quantity: 0,
      imgUrl: 'assets/images/img2.jpg',
      categoryId: 1,
      description: 'Blush pink layered chiffon',
      isNew: false,
    },
    {
      id: 3,
      name: 'Ivory Lace Gown',
      price: 5800,
      quantity: 1,
      imgUrl: 'assets/images/img3.jpg',
      categoryId: 1,
      description: 'Hand-embroidered lace detail',
      isNew: true,
    },

    // Accessories
    {
      id: 4,
      name: 'Gold Chain Mini Bag',
      price: 2800,
      quantity: 5,
      imgUrl: 'assets/images/img4.jpg',
      categoryId: 2,
      description: 'Nude leather with gold chain',
      isNew: true,
    },
    {
      id: 5,
      name: 'Rose Silk Scarf',
      price: 950,
      quantity: 8,
      imgUrl: 'assets/images/img5.jpg',
      categoryId: 2,
      description: 'Pure silk, hand-painted',
      isNew: false,
    },
    {
      id: 6,
      name: 'Pearl Drop Earrings',
      price: 1200,
      quantity: 0,
      imgUrl: 'assets/images/img6.jpg',
      categoryId: 2,
      description: 'Freshwater pearl & rose gold',
      isNew: false,
    },

    // Shoes
    {
      id: 7,
      name: 'Nude Stiletto Heel',
      price: 2100,
      quantity: 4,
      imgUrl: 'assets/images/img7.jpg',
      categoryId: 3,
      description: 'Italian leather, 10cm heel',
      isNew: true,
    },
    {
      id: 8,
      name: 'Rose Gold Mule',
      price: 1800,
      quantity: 2,
      imgUrl: 'assets/images/img8.jpg',
      categoryId: 3,
      description: 'Metallic finish, open toe',
      isNew: false,
    },
    {
      id: 9,
      name: 'Satin Ballet Flat',
      price: 1350,
      quantity: 1,
      imgUrl: 'assets/images/img9.jpg',
      categoryId: 3,
      description: 'Champagne satin with bow',
      isNew: false,
    },

    // Outerwear
    {
      id: 10,
      name: 'Camel Wool Coat',
      price: 6500,
      quantity: 3,
      imgUrl: 'assets/images/img10.jpg',
      categoryId: 4,
      description: 'Double-breasted 100% wool',
      isNew: true,
    },
    {
      id: 11,
      name: 'Blush Faux Fur Jacket',
      price: 4200,
      quantity: 0,
      imgUrl: 'assets/images/img11.jpg',
      categoryId: 4,
      description: 'Oversized luxury faux fur',
      isNew: false,
    },
    {
      id: 12,
      name: 'Nude Trench Coat',
      price: 3900,
      quantity: 2,
      imgUrl: 'assets/images/img12.jpg',
      categoryId: 4,
      description: 'Classic belted silhouette',
      isNew: true,
    }
  ];
  }

  ngOnInit(): void {
    if (this.recievedID === 0) {
      this.filteratedList = this.prdList;
    }
  }

  ngOnChanges(): void {
    this.FilterationList();
  }

  FilterationList() {
    if (+this.recievedID === 0) {
      this.filteratedList = this.prdList;
    } else {
      this.filteratedList = this.prdList.filter(el => el.categoryId === +this.recievedID);
    }
  }

  addToCart(p: IProduct) {
    if (p.quantity === 0) return;
    this.totalPrice += p.price;
    this.total.emit(this.totalPrice);
    p.quantity -= 1;
  }
}
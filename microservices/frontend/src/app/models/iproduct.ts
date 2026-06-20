export interface IProduct {
  _id: string; // MongoDB primary key (string)
  name: string;
  price: number;
  stock: number; // backend field
  quantity: number; // mapped from stock — used by components
  image: string; // backend field
  imgUrl: string; // mapped from image — used by components
  categoryId: string; // MongoDB ObjectId string from backend
  gender?: 'women' | 'men' | 'unisex';
  description: string;
}

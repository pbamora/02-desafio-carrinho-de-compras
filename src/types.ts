export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
  stock: number;
}

export interface Stock {
  id: number;
  amount: number;
}

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get("products");
        setProducts(response.data);
      } catch (error) {}
    }

    async function loadStocks() {
      try {
        const response = await api.get("stock");
        setStocks(response.data);
      } catch (error) {}
    }

    loadProducts();
    loadStocks();
  }, []);

  useEffect(() => {
    if (!cart) return;
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
  }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      const newArrayProducts = [...products];
      const newArrayStocks = [...stocks];

      const product: any = newArrayProducts.find((p) => p.id === productId);
      const stock: any = newArrayStocks.find((p) => p.id === productId);

      const productToCart = {
        id: productId,
        title: product.title,
        price: product.price,
        image: product.image,
        amount: 1,
        stock: stock.amount,
      };

      const productIndex = cart.findIndex((p) => p.id === productId);

      if (productIndex > -1) {
        if (cart[productIndex].amount >= stock.amount) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        cart[productIndex].amount += 1;
        setCart([...cart]);
      } else if (productIndex === -1) {
        setCart([...cart, productToCart]);
        console.log(cart);
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCartArray = [...cart];
      const productIndex = cart.findIndex((p) => p.id === productId);

      if (productIndex === -1) return;

      newCartArray.splice(productIndex, 1);

      setCart(newCartArray);
    } catch {
      return toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const newArrayStocks = [...stocks];
      const stock: any = newArrayStocks.find((p) => p.id === productId);
      const productIndex = cart.findIndex((p) => p.id === productId);

      if (productIndex > -1) {
        if (cart[productIndex].amount < 1) return;

        if (
          cart[productIndex].amount === stock.amount &&
          amount > stock.amount
        ) {
          return toast.error("Quantidade solicitada fora de estoque");
        } else if (cart[productIndex].amount === 0) {
          return;
        }

        cart[productIndex].amount = amount;
        setCart([...cart]);
      }
    } catch {
      return toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

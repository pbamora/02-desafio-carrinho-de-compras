import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
  stock: number;
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
      } catch (error) {
        return toast.error("Quantidade solicitada fora de estoque");
      }
    }

    async function loadStocks() {
      try {
        const response = await api.get("stock");
        setStocks(response.data);
      } catch (error) {
        return toast.error("Quantidade solicitada fora de estoque");
      }
    }

    loadProducts();
    loadStocks();
  }, []);

  useEffect(() => {
    if (!products) return;
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
  }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      const newArrayProducts = [...products];
      const newArrayStocks = [...stocks];

      const productFoundByProducId: any = newArrayProducts.find(
        (p) => p.id === productId
      );
      const stockFoundByProductId: any = newArrayStocks.find(
        (p) => p.id === productId
      );

      const productToCart = {
        id: productId,
        title: productFoundByProducId.title,
        price: productFoundByProducId.price,
        image: productFoundByProducId.image,
        amount: 1,
        stock: stockFoundByProductId.amount,
      };

      const productIndex = cart.findIndex((p) => p.id === productId);

      if (productIndex > -1) {
        if (cart[productIndex].amount >= stockFoundByProductId.amount) {
          throw new Error("Quantidade solicitada fora de estoque");
        }

        cart[productIndex].amount += 1;
        setCart([...cart]);
      } else if (productIndex === -1) {
        if (!productFoundByProducId) return;

        setCart([...cart, productToCart]);
      }
    } catch (err) {
      toast.error(
        err.message.includes("fora de estoque")
          ? err.message
          : "Erro na adição do produto"
      );
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCartArray = [...cart];
      const productIndex = cart.findIndex((p) => p.id === productId);

      if (productIndex === -1) {
        throw new Error("O produto não existe");
      }

      newCartArray.splice(productIndex, 1);

      setCart(newCartArray);
    } catch (err) {
      toast.error(
        err.message.includes("O produto não existe")
          ? err.message
          : "Erro na adição do produto"
      );
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        throw new Error("Quantidade inválida");
      }

      const newArrayStocks = [...stocks];

      const stockFoundByProductId: any = newArrayStocks.find(
        (p) => p.id === productId
      );
      const productIndex = cart.findIndex((p) => p.id === productId);

      if (cart[productIndex].amount < 1) return;

      if (productIndex > -1) {
        if (cart[productIndex].amount < 1) return;

        if (
          cart[productIndex].amount === stockFoundByProductId.amount &&
          amount > stockFoundByProductId.amount
        ) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        cart[productIndex].amount = amount;
        setCart([...cart]);
      }
    } catch (err) {
      toast.error(
        err.message.includes("Quantidade inválida")
          ? err.message
          : "Erro na alteração de quantidade do produto"
      );
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

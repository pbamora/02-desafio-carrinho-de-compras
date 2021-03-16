import React, { useState } from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";

// import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const [value, setValue] = useState<Number>(0);

  // const cartFormatted = cart.map(product => ({
  //   // TODO
  // }))

  let values: Array<number> = [];

  console.log(values);

  for (let index = 0; index < cart.length; index++) {
    const element = cart[index];

    const quantity = element.price * element.amount;

    values.push(quantity);
  }

  const total = values.reduce((acc, item) => item + acc, 0);

  function handleProductIncrement(product: Product) {
    // TODO
    const increment = {
      productId: product.id,
      amount: product.amount + 1,
    };

    updateProductAmount(increment);
  }

  function handleProductDecrement(product: Product) {
    const increment = {
      productId: product.id,
      amount: product.amount - 1,
    };

    updateProductAmount(increment);
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cart &&
            cart.map((product) => (
              <tr key={product.id} data-testid="product">
                <td>
                  <img src={product.image} alt={product.title} />
                </td>
                <td>
                  <strong>{product.title}</strong>
                  <span>{formatPrice(product.price)}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={product.amount <= 1}
                      onClick={() => handleProductDecrement(product)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={product.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(product)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{formatPrice(product.price * product.amount)}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(product.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{formatPrice(Number(total)) || 0} </strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;

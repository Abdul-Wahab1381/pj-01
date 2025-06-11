import React, { useState, useEffect, useMemo, useCallback, useReducer, useRef, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

const INGREDIENTS = [
  { name: 'Lettuce', price: 0.5 },
  { name: 'Cheese', price: 1 },
  { name: 'Tomato', price: 0.7 },
  { name: 'Bacon', price: 1.5 },
  { name: 'Onion', price: 0.3 },
];

const PREDEFINED_BURGERS = [
  { name: 'Classic Burger', ingredients: ['Lettuce', 'Tomato', 'Cheese'], price: 2.2 },
  { name: 'Bacon Deluxe', ingredients: ['Bacon', 'Cheese', 'Onion'], price: 2.8 },
  { name: 'Veggie Delight', ingredients: ['Lettuce', 'Tomato', 'Onion'], price: 1.5 },
];


const reducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'ADD':
      newState = [...state, action.payload];
      break;
    case 'REMOVE':
      newState = state.filter((_, i) => i !== action.payload);
      break;
    case 'CLEAR':
      newState = [];
      break;
    default:
      newState = state;
  }
  localStorage.setItem('burger_cart', JSON.stringify(newState));
  return newState;
};

const CartContext = React.createContext();


 function BurgerMenu() {
  const { dispatchCart } = useContext(CartContext);
  return (
    <div>
      <h1>Burger Menu</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {PREDEFINED_BURGERS.map((burger, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '30%' }}>
            <h2>{burger.name}</h2>
            <p>Ingredients: {burger.ingredients.join(', ')}</p>
            <p>Total: ${burger.price.toFixed(2)}</p>
            <button onClick={() => dispatchCart({ type: 'ADD', payload: burger })}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}


 function BurgerBuilder() {
  const [customIngredients, setCustomIngredients] = useState([]);
  const customBurgerNameRef = useRef();
  const { dispatchCart } = useContext(CartContext);

  const customTotal = useMemo(() =>
    customIngredients.reduce((sum, ing) => {
      const item = INGREDIENTS.find(i => i.name === ing);
      return sum + (item ? item.price : 0);
    }, 0), [customIngredients]
  );

  const toggleIngredient = useCallback((ingredient) => {
    setCustomIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  }, []);

  const addCustomBurgerToCart = () => {
    if (customIngredients.length === 0) return;
    const name = customBurgerNameRef.current?.value || 'Custom Burger';
    dispatchCart({
      type: 'ADD',
      payload: { name, ingredients: [...customIngredients], price: customTotal }
    });
    setCustomIngredients([]);
    if (customBurgerNameRef.current) customBurgerNameRef.current.value = '';
  };

  return (
    <div>
      <h2>Build Your Burger</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {INGREDIENTS.map((item) => (
          <button
            key={item.name}
            onClick={() => toggleIngredient(item.name)}
            style={{
              backgroundColor: customIngredients.includes(item.name) ? '#4caf50' : '#f0f0f0',
              color: customIngredients.includes(item.name) ? '#fff' : '#000',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            {item.name} (${item.price})
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '10px', marginTop: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px' }}>🍔</div>
        <div style={{ margin: '10px 0' }}>
          {customIngredients.map((ing, i) => (
            <div key={i}>{ing}</div>
          ))}
        </div>
        <div style={{ fontSize: '24px' }}>🍔</div>
      </div>

      <input
        ref={customBurgerNameRef}
        placeholder="Name your burger..."
        style={{ marginTop: '10px', padding: '5px', width: '100%' }}
      />
      <p>Total Price: ${customTotal.toFixed(2)}</p>
      <button onClick={addCustomBurgerToCart}>Add Custom Burger to Cart</button>
    </div>
  );
}

function Cart() {
  const { cart, dispatchCart } = useContext(CartContext);
  return (
    <div>
      <h2>Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cart.map((item, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
            <h3>{item.name}</h3>
            <p>Ingredients: {item.ingredients.join(', ')}</p>
            <p>Price: ${item.price.toFixed(2)}</p>
            <button onClick={() => dispatchCart({ type: 'REMOVE', payload: idx })}>Remove</button>
          </div>
        ))
      )}
      {cart.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button onClick={() => dispatchCart({ type: 'CLEAR' })}>Clear Cart</button>
        </div>
      )}
    </div>
  );
}

export function App() {
  const [cart, dispatchCart] = useReducer(reducer, [], () => {
    const localData = localStorage.getItem('burger_cart');
    return localData ? JSON.parse(localData) : [];
  });

  return (
    <CartContext.Provider value={{ cart, dispatchCart }}>
      <Router>
        <div style={{ padding: '20px' }}>
          <nav style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
            <Link to="/">Burger Menu</Link>
            <Link to="/builder">Build Burger</Link>
            <Link to="/cart">Cart ({cart.length})</Link>
          </nav>
          <Routes>
            <Route path="/" element={<BurgerMenu />} />
            <Route path="/builder" element={<BurgerBuilder />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
      </Router>
    </CartContext.Provider>
  );
}

// ======= Render =======
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

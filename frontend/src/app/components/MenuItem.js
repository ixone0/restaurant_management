import React from 'react';

const MenuItem = ({ item, addToCart }) => {
    return (
        <div>
            <h3>{item.name}</h3>
            <p>{item.description || 'No description available'}</p>
            <p>Price: ${item.price}</p>
            {item.imageUrl && <img src={item.imageUrl.startsWith('./') ? item.imageUrl.replace('./', '/') : item.imageUrl} alt={item.name} style={{ width: '100px', height: '100px' }} />}
            <button onClick={() => addToCart(item)}>Add to Cart</button>
        </div>
    );
};

export default MenuItem;
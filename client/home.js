import React, { useState } from 'react';
import '../styles/home.css'; 
import axios from 'axios'; // Import axios for HTTP requests

const Home = () => {
  const [location, setLocation] = useState('');
  const [product, setProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // POST request to the backend server
      const response = await axios.post('http://localhost:5000/run-scripts', { location, product });
      
      // Log the response data as JSON in the console
      console.log('Response Data in JSON:', JSON.stringify(response.data, null, 2));

      setResult(response.data.results); // Store the result in state to display on UI
    } catch (error) {
      console.error('Error running scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1>Search Products</h1>
      
      <div className="input-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          value={location}
          placeholder="Enter location"
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="product">Product</label>
        <input
          type="text"
          id="product"
          value={product}
          placeholder="Enter product"
          onChange={(e) => setProduct(e.target.value)}
        />
      </div>
      
      <button className="search-button" onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {result && (
        <div className="results">
          <h2>Search Results:</h2>
          {result.map((output, index) => (
            <pre key={index}>{output}</pre>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

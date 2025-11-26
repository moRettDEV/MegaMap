import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import './Search.css';

const Search = ({ onSearch = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="search-container">
      <Form.Group className="search-group">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <Form.Control
            type="text"
            placeholder="Search layers..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
            >
              ✕
            </button>
          )}
        </div>
      </Form.Group>
    </div>
  );
};

export default Search;
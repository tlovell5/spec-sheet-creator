import React, { memo, useState, useEffect } from 'react';

const IngredientsTable = ({ 
  ingredients, 
  onAddIngredient, 
  onRemoveIngredient, 
  onUpdateIngredient 
}) => {
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  
  // Calculate totals when ingredients change
  useEffect(() => {
    // Calculate total percentage
    const totalPct = ingredients.reduce((sum, ingredient) => {
      return sum + (parseFloat(ingredient.percentage) || 0);
    }, 0);
    
    // Calculate total weight (sum of all ingredient weights)
    const totalWt = ingredients.reduce((sum, ingredient) => {
      return sum + (parseFloat(ingredient.weight) || 0);
    }, 0);
    
    setTotalPercentage(totalPct);
    setTotalWeight(totalWt);
  }, [ingredients]);

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Percentage (%)</th>
            <th>Weight (lbs)</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No ingredients added yet</td>
            </tr>
          ) : (
            ingredients.map((ingredient, index) => (
              <tr key={ingredient.id || index}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredient.name || ''}
                    onChange={(e) => onUpdateIngredient(index, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredient.percentage || ''}
                    onChange={(e) => onUpdateIngredient(index, 'percentage', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredient.weight || ''}
                    onChange={(e) => onUpdateIngredient(index, 'weight', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredient.notes || ''}
                    onChange={(e) => onUpdateIngredient(index, 'notes', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onRemoveIngredient(index)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            <th>{totalPercentage.toFixed(2)}%</th>
            <th>{totalWeight.toFixed(2)} lbs</th>
            <th colSpan="2"></th>
          </tr>
        </tfoot>
      </table>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onAddIngredient}
      >
        Add Ingredient
      </button>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(IngredientsTable);

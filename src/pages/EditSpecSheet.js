import React from 'react';
import { useParams } from 'react-router-dom';

function EditSpecSheet() {
  const { id } = useParams();

  return (
    <div>
      <h1>Edit Spec Sheet</h1>
      <p>Editing spec sheet with ID: {id}</p>
      {/* Add form elements to edit spec sheet details here */}
    </div>
  );
}

export default EditSpecSheet;
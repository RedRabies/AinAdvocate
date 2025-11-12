import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/api/uploads", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>📁 File Upload (AinAdvocate)</h1>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} required />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
      {preview && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Preview:</h4>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "300px", borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;

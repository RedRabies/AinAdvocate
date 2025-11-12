// src/App.js
import React, { useState, useEffect } from "react";

function App() {
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", clientName: "", lawyerName: "" });

  // Fetch cases from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/cases")
      .then(res => res.json())
      .then(data => setCases(data))
      .catch(err => console.error("Error fetching cases:", err));
  }, []);

  // Submit new case
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCases(prev => [...prev, data]);
    setForm({ title: "", description: "", clientName: "", lawyerName: "" });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🧾 AinAdvocate Case Management</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          placeholder="Case Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        /><br /><br />
        <textarea
          placeholder="Case Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        /><br /><br />
        <input
          placeholder="Client Name"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          required
        /><br /><br />
        <input
          placeholder="Lawyer Name"
          value={form.lawyerName}
          onChange={(e) => setForm({ ...form, lawyerName: e.target.value })}
        /><br /><br />
        <button type="submit">Add Case</button>
      </form>

      <h2>📚 All Cases</h2>
      <ul>
        {cases.map((c) => (
          <li key={c._id}>
            <strong>{c.title}</strong> — {c.description} (Client: {c.clientName})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

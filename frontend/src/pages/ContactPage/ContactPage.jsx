// src/pages/ContactPage.jsx
import React, { useState } from "react";
import client from "../../api/client"; // axios instance configured to your backend
import "./ContactPage.scss";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await client.post("/messages", form); // send data to backend
      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-bg min-h-screen flex-center">
      <div className="contact-card">
        <h1 className="contact-title">Contact Us</h1>
        {success && <p className="contact-success">{success}</p>}
        {error && <p className="contact-error">{error}</p>}
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Full Name *
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Subject *
            <input
              type="text"
              name="subject"
              required
              value={form.subject}
              onChange={handleChange}
            />
          </label>
          <label>
            Message *
            <textarea
              name="message"
              rows="5"
              required
              value={form.message}
              onChange={handleChange}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

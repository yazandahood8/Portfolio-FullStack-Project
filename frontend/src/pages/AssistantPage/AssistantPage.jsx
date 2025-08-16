import React, { useState } from 'react';
import './AssistantPage.css';
import useAuth from '../../hooks/useAuth';

export default function AssistantPage() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // { sender: 'user'|'ai', text: string }
  const [loading, setLoading] = useState(false);

  // New: plan preview + execution
  const [plan, setPlan] = useState(null);      // array of { action, params }
  const [executing, setExecuting] = useState(false);

  const previewPlan = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/assistant/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: input })
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.plan) && data.plan.length) {
        setPlan(data.plan);
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: 'Here is what I plan to do. Review and confirm to run.' }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `❌ Could not create a plan: ${data?.error || 'Unknown error'}` }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: '❌ Error: Could not reach assistant.' }]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  const executeCurrentPlan = async () => {
    if (!plan) return;
    setExecuting(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/assistant/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan })
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        const lines = (data.results || []).map((r, i) =>
          r.error
            ? `#${i + 1} ${r.step?.action} → ❌ ${r.error}`
            : `#${i + 1} ${r.step?.action} → ✅ ${r.result?.message || 'Success'}`
        );
        setMessages((prev) => [...prev, { sender: 'ai', text: `Executed:\n${lines.join('\n')}` }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `❌ Execution failed: ${data?.error || 'Unknown error'}` }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: '❌ Error: Could not execute plan.' }]);
    } finally {
      setExecuting(false);
      setPlan(null);
    }
  };

  const cancelPreview = () => {
    setPlan(null);
    setMessages((prev) => [...prev, { sender: 'ai', text: 'Okay, I will not run these actions.' }]);
  };

  const renderParamsTable = (obj) => {
    if (!obj) return null;
    const entries = Object.entries(obj);
    if (!entries.length) return <em>(no params)</em>;
    return (
      <table className="params-table">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k}>
              <td className="param-key">{k}</td>
              <td className="param-val">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="assistant-container">
      <h1 className="assistant-title">AI Assistant</h1>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-msg ${msg.sender}`}>
            <div className="chat-bubble">
              {String(msg.text)
                .split('\n')
                .map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg ai">
            <div className="chat-bubble">Typing...</div>
          </div>
        )}

        {/* Plan preview panel */}
        {Array.isArray(plan) && plan.length > 0 && (
          <div className="preview-panel">
            <div className="preview-header">Proposed Actions</div>
            <ol className="preview-list">
              {plan.map((step, idx) => (
                <li key={idx} className="preview-item">
                  <div className="action-line">
                    <span className="action-name">{step.action}</span>
                  </div>
                  {renderParamsTable(step.params)}
                </li>
              ))}
            </ol>
            <div className="preview-actions">
              <button className="confirm-btn" onClick={executeCurrentPlan} disabled={executing}>
                {executing ? 'Running…' : 'Confirm & Run'}
              </button>
              <button className="cancel-btn" onClick={cancelPreview} disabled={executing}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder="Tell me what to do (e.g., Add skill: Angular (Expert))"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && previewPlan()}
        />
        <button className="chat-send-btn" onClick={previewPlan} disabled={loading || !input.trim()}>
          Preview
        </button>
      </div>
    </div>
  );
}

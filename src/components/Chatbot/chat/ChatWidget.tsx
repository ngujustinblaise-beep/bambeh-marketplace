// @ts-nocheck
<div className="p-4 text-sm">
  <p>Chat loaded: {messages.length} messages</p>
  <p>Input: "{inputMessage}"</p>
  <p>Sending: {isSending.toString()}</p>
  <button onClick={() => console.log("Manual tick")}>Debug</button>
</div>;



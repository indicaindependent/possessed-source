import { Component } from 'react';

// Keeps a render crash from leaving a blank screen; offers a way back home.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-ink p-6 text-center">
        <h1 className="title-emboss font-display text-3xl font-black text-parchment">Something went bump</h1>
        <p className="max-w-sm font-body text-muted-foreground">The house got a little too haunted. Head back and try again.</p>
        <button type="button" onClick={() => { window.location.href = '/'; }} className="min-h-[44px] rounded-xl bg-pumpkin px-6 font-body font-extrabold text-ink">Back to the house</button>
      </div>
    );
  }
}
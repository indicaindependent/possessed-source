const UserNotRegisteredError = () => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-ink p-6 text-center">
    <h1 className="title-emboss font-display text-3xl font-black text-parchment">Access restricted</h1>
    <p className="max-w-sm font-body text-muted-foreground">You are not registered to use this app. Ask the app's owner for access, or sign in with a different account.</p>
  </div>
);

export default UserNotRegisteredError;
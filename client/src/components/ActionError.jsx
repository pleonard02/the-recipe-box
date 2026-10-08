function ActionError({ message }) {
  if (!message) return null;
  const displayMessage = /failed to fetch|networkerror|load failed/i.test(message)
    ? "Could not reach the server. Check your connection and try again."
    : message;

  return (
    <p role="alert" className="my-4 rounded-xl border border-red-200 bg-[#fff0ed] px-4 py-3 text-sm font-medium text-[#9b2424]">
      {displayMessage}
    </p>
  );
}

export default ActionError;

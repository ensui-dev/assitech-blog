function ErrorMessage({ message }) {
  return (
    <div className="error">
      <h2>Oops! Something went wrong</h2>
      <p>{message || 'Failed to load content. Please try again later.'}</p>
    </div>
  );
}

export default ErrorMessage;

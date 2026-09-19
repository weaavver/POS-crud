export default function Spinner({ size = 16, className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={'inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px] ' + className}
      style={{ width: size, height: size }}
    />
  );
}
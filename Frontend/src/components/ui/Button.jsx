import './button.css';

const Button = ({ children, variant = "primary", fullWidth }) => {
  return (
    <button className={`btn ${variant} ${fullWidth ? "full" : ""}`}>
      {children}
    </button>
  );
};

export default Button;
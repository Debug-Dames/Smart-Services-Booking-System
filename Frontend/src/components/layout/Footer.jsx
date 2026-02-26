export default function Footer() {
  return (
    <footer style={footerStyle}>
      <small>© {new Date().getFullYear()} Dames Beauty Salon</small>
      <small>All Rights Reserved</small>
      <br></br>
      <small>working hours: monday9am-6pm</small>
      <small>tuesday9am-6pm</small>
      <small>wednesday9am-6pm</small>
      <small>thursday9am-6pm</small>
      <small>friday9am-6pm</small>
      <br></br>
      <small>contact us: dames hair</small>
      <small>working hours :sat-sun 8am-8pm</small>
    </footer>
  );
}

const footerStyle = {
  textAlign: 'center',
  backgroundColor: '#22274C',
  color: '#BDC2DB',
  padding: '1rem',
};
